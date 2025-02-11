---
layout: post
giscus_comments: true
title: "MPI4py under Slurm"
date: 2025-02-11 09:00:00 +0900
tag: tadashi
categories: programming
related_publications: true
tikzjax: true
---

For [TADASHI](/projects/tadashi) we are building a "benchmarking
harness", which would have a main instance running on one node of a
cluster, and distribute to other nodes the code transformation
(potentially), the compilation and the measurement of transformed
apps.

# Benchmarking harness specifications

The key functionalities required by the harness are:

- it should have a python interface and
- it should distribute the benchmarking across nodes of a cluster/supercomputer.

# Candidate solutions

[Celery](https://docs.celeryq.dev/en/stable/) and
[Jolt](https://jolt.readthedocs.io/en/latest/) came up as possible
solutions, however we ended up trying only [Ray](https://www.ray.io/)
and [MPI4py](https://mpi4py.readthedocs.io/en/stable/).

Both Ray and MPI4py had some sort of implementations for [Python
futures](https://docs.python.org/3/library/concurrent.futures.html),
and this looked like a good way to implement the benchmarking
harness. I opted for MPI4py since it is a better fit for the MPI-based
HPC clusters we have access to.

The plan™ was to implement everything using Pythons
`concurrent.futures` on my trusty little laptop, and then just swap
out `concurrent.futures` with `mpi4py.futures`. But as it is often the
case, life wasn't so simple.

# The cluster environment

Also, as it is often the case, the required software is often not
available on the cluster. So, the first round of crocodile wrestling
was compiling a bunch of libraries and getting them all to work
together. That was a pain in the neck, but doable.

# The wrench in the gears: Figuring out (how to invoke) MPI4py when we want to use futures

After figuring Tadashi's dependencies, the time came to "just swap
out"™ `futures` (and `Executor`) from Python's `concurrent` with
MPI4py's implementation.

## The right MPI, which supports `MPI_Comm_spawn`

Something which came up earlier in the development of the benchmarking
harness was
[Fugaku](<https://en.wikipedia.org/wiki/Fugaku_(supercomputer)>)'s
support for master-worker jobs/workloads, which uses
[`MPI_Comm_spawn`](https://www.mpi-forum.org/docs/mpi-4.1/mpi41-report/node289.htm#Node289)
to dynamically spawn processes, and incidentally, MPI4py `futures`,
more precisely the
[`MPIPoolExecutor`](https://mpi4py.readthedocs.io/en/stable/mpi4py.futures.html#mpipoolexecutor),
also uses `MPI_Comm_spawn` under the hood. So it was a bit
disappointing when I realised [OpenMPI doesn't support
`MPI_Comm_spawn`](). However, MPICH, which does support
`MPI_Comm_spawn`, was also available on the cluster and I just needed
to recompile MPI4py with MPICH loaded to use it.

## Testing went well

Initially, it was a bit hard to wrap my head around how
`MPI_Comm_spawn` works, in my head `MPI_COMM_WORLD` is everything MPI
is/can be aware of, but it turns out, if you have an allocation larger
then `MPI_COMM_WORLD`, MPI still knows about it. This means, if you
have an allocation of 10 nodes, you don't lunch your master/parent
program with `mpirun -n 10` but with `mpirun -n 1` and it will spawn
processes on the remaining 9 nodes. So I logged in the cluster, got an
interactive node, copy-pasted some example code for MPI4py spawn, and
tested it -- everything looked fine.

## Unwanted behaviour & back to the basics

However, when I swapped `concurrent.futures` with `mpi4py.futures`,
and wrote a submission script (to be launched by `sbatch`), things
didn't quite work. First, I realised the state of Tadashi which is in
the binary `.so` files did not get pickled and transferred to the
workers. After, temporarily disabling `.so` dependent code, I tried to
rerun things, which did not fail!

However, when, for some reason I remembered to check if the workers
are actually being executed on different nodes, it turned out this is
not the case: when checking `gethostname` both master and workers were
executed on the same node (and the other allocated nodes remained
idle).

## 3 ways to run thing in Slurm, and finding what threw the wrench in the gears

Ultimately, the proverbial wrench in the gears, (aka bug, aka WTF)
came down to the different ways you can launch programs with Slurm:
using `srun`, `salloc` and `sbatch`.

`srun` allocates you resources from a cluster, and runs your binary (I
like to think about `srun` as `mpirun`, but it is "aware" of the
resources). `salloc` doesn't run the program, it just allocates
resources, and if a command is provided it executes that command only
once, i.e. not on all nodes. To utilise all nodes within an allocation
obtained by `salloc`, one would call `srun`. Finally, `sbatch` is like
`srun` but instead of getting the allocation and running it
immediately (dumping stdout to the terminal), `sbatch` puts the
job/command in the queue, and saves the output into a `slurm-*.out`
file.

## Getting it right

To get to the bottom of things, I ended up writing a (pair of) simple
MPI programs, `spawn_main.c` and `spawn_child.c`, each reporting the
hostname. And again I made the mistake of running things from an
interactive node, which I obtained using `srun -N 3 -p genoa --pty
bash`. From thin interactive instance, running `mpirun -N 1
./spawn_main` gave the desired results: the main and child processes
were all reporting different hostnames.

The moment of clarity came when I wanted to present the full example,
and wrote a `spawn_submit.sh` submission script, which I launched with
`sbatch`. Lo and behold, I was back to the undesired behaviour of both
main and child instances reporting the same hostname! This meant, that
calling `mpirun -N 1 ./spawn_main` didn't do the same thing when
called from a submission script and when called from an interactive
session.

I tried emulating the interactive session by running `mpirun` inside
`bash` inside `srun`, i.e.

```
srun bash -c 'mpirun -N 1 ./spawn_main`
```

The results was a new kinda of undesired behaviour. Now `mpirun` saw
all the allocated nodes and processes were reporting different
hostnames, but each hostname was printed 3 times. It seems `srun`
executed `mpirun` 3x, but oddly enough the main process was always on
the same node (i.e. not on all 3 nodes for the 3x execution of
`srun`).

I obtained the first working solution by adding another `if` to the
monstrosity above which checked the "slurm rank", i.e.

```
srun bash -c '[ $SLURM_NODEID = 0 ] && mpirun -N 1 ./spawn_main || true'
```

Calling `mpirun` inside `srun` already felt wrong, and the added
complications didn't improve the situation, so after some googling I
fond an [SO
question](https://stackoverflow.com/questions/74160847/spawning-child-processing-on-hpc-using-slurm)
asking about launching `MPI_Comm_spawn` from slurm, and copied the
batch script parameters from there and it worked.

It turns out, the missing ingredient was a missing `-n 3` for the job
allocation. The final working solution looks like this:

```
#!/usr/bin/bash
#SBATCH -p genoa
#SBATCH -N 3
#SBATCH -n 3
#SBATCH -c 1

# ... snip ...

mpirun -N 1 spawn_main
```

`-N` is the number of nodes allocated, `-n` is the number of tasks
(i.e. number of MPI ranks). The solution is valid without `-c 1`
(number of CPUs per task/rank), but I left it in just in case.
