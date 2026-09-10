---
layout: post
giscus_comments: true
title: "Why you can't just remove OpenMP pragmas"
date: 2026-09-10 09:00:00 +0900
categories: programming
description: A HeCBench kernel where the pragmas are the program, not a decoration on it
---

There is a comfortable story about OpenMP that most of us have told at some point: pragmas are _hints_. Strip them out, compile without `-fopenmp`, and you get the same program, just slower. It's the reason OpenMP is pleasant to teach, and the reason "just remove the pragmas to debug it" is such a common piece of advice.

It is also, quite often, false. The a nice counterexample I have found recently lives in [HeCBench](https://github.com/ORNL/HeCBench), in [`src/softmax-online-omp/main.cpp`](https://github.com/ORNL/HeCBench/blob/139da6d97ab8c16fce445c75ff596e9c7e2def11/src/softmax-online-omp/main.cpp)[^pin] --- and what makes it nice is that the file contains _both_ kinds of kernel, twenty lines apart.

[^pin]: Pinned to commit `139da6d`, so the line numbers below don't rot.

# The kernel where the story holds

Here is the baseline softmax (lines 16--35, loop bodies elided):

```cpp
void softmax_forward_baseline_kernel(int grid_size, int block_size, float* out, const float* inp, int N, int C) {
  #pragma omp target teams distribute num_teams(grid_size)
  for (int row = 0; row < N; row++) {
    const float* x = inp + row * C;
    float* const y = out + row * C;
    float maxval = -INFINITY, sumval = 0.0f;
    #pragma omp parallel for reduction(max:maxval) num_threads(block_size)
    for (int i = 0; i < C; i++) { /* maxval = fmaxf(x[i], maxval); */ }
    #pragma omp parallel for reduction(+:sumval) num_threads(block_size)
    for (int i = 0; i < C; i++) { /* sumval += expf(x[i] - maxval); */ }
    #pragma omp parallel for num_threads(block_size)
    for (int i = 0; i < C; i++) { /* y[i] = expf(x[i] - maxval) / sumval; */ }
  }
}
```

Delete every `#pragma` here and you are left with three honest C loops over `C`, inside an honest C loop over `N`. The pragmas said _how_ to run the iteration space; the iteration space itself is written in the code. This is the case the folklore describes, and here the folklore is right.

# The kernel where it doesn't

Now the online version, lines 37--88 of the same file. This one implements the [online softmax](http://arxiv.org/abs/1805.02867) trick: fuse the max pass and the sum pass into one, rescaling the running sum whenever a new maximum shows up, so you make two passes over the data instead of three.

```cpp
void softmax_forward_online_kernel(int grid_size, int block_size, float* out, const float* inp, int N, int C) {

  #pragma omp target teams num_teams(grid_size) thread_limit(block_size)
  {
    float smem[1024];
    #pragma omp parallel
    {
      int row = omp_get_team_num();
      if (row < N) {
        const float* x = inp + row * C;
        float* const y = out + row * C;

        float maxval = -INFINITY, sumval = 0.0f;

        int tid = omp_get_thread_num();
        for (int i = tid; i < C; i += block_size) {
          /* running max + rescaled running sum */
        }
        smem[tid] = maxval;
        #pragma omp barrier

        for (int stride = block_size / 2; stride > 0; stride /= 2) {
          if (tid < stride) smem[tid] = fmaxf(smem[tid], smem[tid + stride]);
          #pragma omp barrier
        }

        float global_maxval = smem[0];
        /* ... second tree, this one summing, giving global_sum ... */

        for (int i = tid; i < C; i += block_size) {
          y[i] = expf(x[i] - global_maxval) / global_sum;
        }
      }
    }
  }
}
```

Look at the two kernels side by side and the whole point falls out of two lines:

```cpp
for (int row = 0; row < N; row++)   // baseline, l.18: iteration space is in the code
int row = omp_get_team_num();       // online,   l.44: iteration space is in the pragma
```

In the online kernel there is no loop over `N` and no loop over the `block_size` threads. Those two loops exist _only_ as `num_teams(grid_size)` and `thread_limit(block_size)` on line 39. The body is written from the point of view of a single (team, thread) pair, CUDA-style, and it asks the runtime who it is.

So what happens if I do the literal thing --- delete the `#pragma omp` lines, keep `#include <omp.h>`, keep `-fopenmp`? Nothing fails to compile, and nothing fails to link. `omp_get_team_num()` and `omp_get_thread_num()` are perfectly legal outside any parallel region; they just both return `0`. That is exactly what makes this a bad afternoon: it builds, it runs, and it is wrong.

## 1. The loop over rows evaporates

`row` becomes `0`. The kernel writes one row. `main()` calls it with `N = B*T = 8*1024 = 8192`, so 8191 rows of `out` are never touched --- the benchmark's `validate_result` will be comparing whatever `malloc` handed back.

## 2. The strided loop shrinks instead of serializing

This is my favourite one, because it reads like a loop over `C`:

```cpp
for (int i = tid; i < C; i += block_size)
```

With `tid = 0` it does not become "the whole range done sequentially". It becomes `i = 0, block_size, 2*block_size, ...` --- one thread's _slice_, which is what it always was. The stride was never a parallelism artefact the compiler could undo; it is a plain C expression, and `block_size` is still 64. With `C = V = 50257`, that visits 786 of 50257 elements. A serial reading of that loop is only correct if you also rewrite `+= block_size` to `++`, which no amount of removing pragmas will do for you.

## 3. The reduction trees don't get skipped --- they corrupt

One could hope the tree reductions become harmless no-ops. They don't:

```cpp
smem[tid] = maxval;
for (int stride = block_size / 2; stride > 0; stride /= 2) {
  if (tid < stride) smem[tid] = fmaxf(smem[tid], smem[tid + stride]);
}
```

`smem` is an uninitialised 1024-element stack array. Only `smem[0]` ever gets written now. But the `stride` loop is ordinary C, so it still runs all six iterations, and `tid < stride` is true every time, so every iteration reads `smem[stride]` --- uninitialised stack. `global_maxval` is indeterminate, and `expf(x[i] - global_maxval)` gives you zeros, infinities or NaNs depending on the garbage. The same happens to `global_sum`, which then also divides.

Combine 1--3 and the failure mode is: **one row out of 8192 is written, a 1/64th subset of it, with values computed from uninitialised memory.** No crash, no warning, no diagnostic.

The `#pragma omp barrier` lines, for what it's worth, are the only ones that _are_ safe to remove --- a barrier in a single-threaded region is a no-op. But that is a coda, not a consolation: removing only the barriers while keeping `#pragma omp parallel` gives you the other classic bug, a data race on `smem` with results that change between runs.

# The general shape of the problem

The pragmas here are not annotations on a sequential program. They are the program's index space, and the body is a _function of the thread identity_, obtained by calling the runtime rather than by receiving a loop variable. Everything else follows: identity queries degrade to `0` instead of failing, so removing the parallelism silently reduces the iteration space rather than flattening it.

That gives a rule of thumb I have started applying when reviewing offload code: **if the body calls `omp_get_thread_num()` or `omp_get_team_num()`, the pragma is load-bearing.** The sequential-equivalence property you were relying on is already gone.

# How to fix it

The reason the author reached for `omp_get_thread_num()` is real: online softmax's partial results don't combine with `reduction(max:)` or `reduction(+:)`, because each thread's partial sum is scaled relative to _its own_ running max. You cannot express that with two independent built-in reductions --- hence the hand-written smem trees.

But it _is_ a reduction; just not a built-in one. The pair $$(m, s)$$ forms a monoid under

$$
(m_a, s_a) \oplus (m_b, s_b) = \Big(m, \; s_a e^{m_a - m} + s_b e^{m_b - m}\Big), \quad m = \max(m_a, m_b)
$$

which is precisely what OpenMP's `declare reduction` is for:

```cpp
struct MaxSum { float maxval, sumval; };

static inline MaxSum merge(MaxSum a, MaxSum b) {
  if (a.sumval == 0.0f) return b;   // identity: see the note below
  if (b.sumval == 0.0f) return a;
  MaxSum r;
  r.maxval = fmaxf(a.maxval, b.maxval);
  r.sumval = a.sumval * expf(a.maxval - r.maxval)
           + b.sumval * expf(b.maxval - r.maxval);
  return r;
}

#pragma omp declare reduction(online : MaxSum : omp_out = merge(omp_out, omp_in)) \
        initializer(omp_priv = MaxSum{-INFINITY, 0.0f})

void softmax_forward_online_kernel(int grid_size, int block_size, float* out,
                                   const float* inp, int N, int C) {
  #pragma omp target teams distribute num_teams(grid_size)
  for (int row = 0; row < N; row++) {
    const float* x = inp + row * C;
    float* const y = out + row * C;

    MaxSum acc = {-INFINITY, 0.0f};
    #pragma omp parallel for num_threads(block_size) reduction(online : acc)
    for (int i = 0; i < C; i++)
      acc = merge(acc, MaxSum{x[i], 1.0f});

    #pragma omp parallel for num_threads(block_size)
    for (int i = 0; i < C; i++)
      y[i] = expf(x[i] - acc.maxval) / acc.sumval;
  }
}
```

Now delete every `#pragma`: two nested C loops over `N` and `C`, computing the same thing. The property is back, and it is back _by construction_ --- there is no thread identity in the body to degrade.

Two things worth saying about this version.

**It keeps the online trick.** It is still two passes over the row, not three. The fusion of the max and the sum lives in `merge`, not in the manual thread decomposition, which is where it belonged all along.

**Those two early returns in `merge` are not defensive padding.** The identity $$(-\infty, 0)$$ does not survive the naive formula: $$-\infty - (-\infty)$$ is NaN, `expf(NaN)` is NaN, and $$0 \cdot \text{NaN}$$ is NaN, so merging two identities poisons the whole reduction. This is not hypothetical --- with the unguarded combiner, a `parallel for` with 64 threads over an empty range returns `{-inf, -nan}`, and any thread that receives zero iterations feeds an identity into the tree. With the guards it returns `{-inf, 0}` and behaves. The test `sumval == 0.0f` is a safe identity check here because any non-empty partial has $$s \geq 1$$: its own maximal element contributes $$e^0 = 1$$.[^verify]

[^verify]: I checked both the NaN and the numerics on the host with GCC. Against a double-precision reference on a 5000-element row with `num_threads(1024)`, max absolute error was `2.3e-09` and the outputs summed to `1.000000`.

## The fallback, if `declare reduction` isn't an option

The surrounding structure is not the risky part --- `target teams distribute` with an inner `parallel for num_threads(...)` is exactly the shape of the baseline kernel in the same file, which the benchmark already validates. The user-defined reduction is: `declare reduction` inside a `target` region is the sort of thing offload compiler support is uneven about, and I have not tested this one on a GPU. If it doesn't survive your toolchain, the portable rewrite is **loop fission over the barriers**: turn the implicit thread loop into a real `for (int tid = 0; tid < block_size; tid++)`, and split it into one loop per phase, cutting at each `#pragma omp barrier`. Per-thread scalars like `maxval` and `sumval` get promoted to `block_size`-sized arrays, the way `smem` already holds the maxima.

The barrier then _is_ the end of a loop, which is the point: sequential execution of consecutive loops gives you the ordering the barrier was buying, so the pragma-free version stays correct. It is more verbose than the original and considerably more verbose than the reduction, and it drags the power-of-two `block_size` assumption along with it. That is an honest cost. Sequential equivalence is a property you pay for --- it just tends to be cheaper than an afternoon spent staring at one correct row out of 8192.
