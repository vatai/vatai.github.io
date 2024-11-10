---
layout: post
title: "Installing PyTorch with MPI support on ABCI"
date: 2021-09-01 17:00:00 +0900
categories: tutorial MPI ABCI
---

To get MPI backend for [`torch distributed`](https://pytorch.org/docs/stable/distributed.html) working you need to
recompile PyTorch.

On ABCI to get this working, you need to load these modules (some of
them might be not needed, I just grabbed a `modules.sh` file):

    module load gcc/9.3.0
    module load cuda/11.2/11.2.2
    module load cudnn/8.1/8.1.1
    module load nccl/2.8/2.8.4-1
    module load openmpi/4.0.5
    module load python/3.8/3.8.7
    module load cmake/3.19

After this we just need to clone the PyTorch repo:

    git clone git@github.com:pytorch/pytorch.git

and build it:

    python3 setup.py develop --user

This **overwrites** your current PyTorch installation, and you need to
use `--upgrade --forece-reinstall` with `pip3` to install the original
one.
