---
layout: post
giscus_comments: true
title: "[draft] SCoPing SNAP"
date: 2025-04-15 09:00:00 +0900
tag: tadashi
categories: programming
related_publications: true
tikzjax: true
---

# SCoPing SNAP

This post describes my (ultimately failed) attempts to run [Tadashi](/projects/tadashi) {% cite vatai2025tadashi %} on [SNAP](https://github.com/lanl/SNAP).

## TL;DR

- Detecting SCoPs
- The new error
- Running the pre-processor and lessons learned (aka PET uses ~clang~)
- Product of parameters error
- Macros simulating fortran arrays
- Ultimate failure and examples of non-SCoPs

## SCoP finding utilities: `scop_detector` and `scops_in_dir`

Tadashi relies on ISL and more accurately PET {% cite verdoolaege2012polyhedral %} to extract the SCoP from a source file. It is not hard to write a utility which exclusively does this and instead of any serious polyhedral compilation it just gives a rough (or complete if time/space allows it)

# Old stuff

In the search for realistic apps I wrote `scop_detector`, a very simple program which would run PET's automatic scop detection algorithm on any given `.c` file, and print out the found schedule trees along with a summary (number of SCoPs, max depth of SCoPs, filename, etc.).
Since this worked only on single files, a natural course of action was to add support for multiple files.
This was achieved by wrapping it in a Bash script (`scops_in_dir`) which iterated (recursively) through all `.c` file in a directory and invoked `scop_detector` with them.
This made "probing" projects for SCoPs trivial: clone/download the source code, run `scops_in_dir` and keep an eye out for a big/deep schedule tree.
SNAP was one of the first apps which looked promising to extract SCoPs from!

`scop_detector` showed a deep schedule tree indicating multiple nested loops, which was promising, but it also printed an error which I saw for the first time saying "data dependent conditions not supported".
The error message was coming from code copied from [PPCG](https://repo.or.cz/ppcg.git) {% cite verdoolaege2013polyhedral %}, which was copied as part of the dead code elimination algorithm.
The code revealed a loop with a boundary being a product of two parameters.
It seemed that product can be calculated as a new SCoP parameter (before the SCoP).
However, after the attempt to fix this issue the error still persisted.
