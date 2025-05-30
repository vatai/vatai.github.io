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

This post describes my (ultimately failed) attempts to run [Tadashi](/projects/tadashi) {% cite vatai2024tadashi %} on [SNAP](https://github.com/lanl/SNAP).

In the search for realistic apps I wrote `scop_detector`, a very simple program which would run PET's automatic scop detection algorithm on any given `.c` file, and print out the found schedule trees along with a summary (number of SCoPs).
This was obviously wrapped in a `scops_in_dir` script which ran it on all the `.c` files in a directory, which made "probing" projects for SCoPs trivial: clone/download the source code, run `scops_in_dir` and keep an eye out for a big/deep schedule tree.
SNAP was one of the first apps which looked promising to extract SCoPs from!

`scop_detector` showed a deep schedule tree indicating multiple nested loops, which was promising, but it also printed an error which I saw for the first time saying "data dependent conditions not supported".
The error message was coming from code copied from [PPCG](https://repo.or.cz/ppcg.git) {% cite verdoolaege2013polyhedral %}, which was copied as part of the dead code elimination algorithm.
The code revealed a loop with a boundary being a product of two parameters.
It seemed that product can be calculated as a new SCoP parameter (before the SCoP).
However, after the attempt to fix this issue the error still persisted.

