---
title: "Continuous benchmarking on supercomputers"
date: 2022-05-18 20:12:00 +0900
categories: programming
---


A paper by Anzt, H. et al. [Towards Continuous Benchmarking: An
Automated Performance Evaluation Framework for High Performance
Software](https://doi.org/10.1145/3324989.3325719) describes the
posibilities of *continuous benchmarking* (CB), however it doesn't
give direct instructions how to implement it.  Looking at the source
code is always a possibility, but the `yaml` files there aren't really
documented (which is no surprises since they are pretty self evident).
Still, I hope this post will help people who unfamiliar with
*Continuous X* approaches (where X can be integration, development,
benchmarking etc).

