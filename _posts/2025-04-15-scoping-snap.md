---
layout: post
giscus_comments: true
title: "SCoPing SNAP"
date: 2025-04-15 09:00:00 +0900
tag: tadashi
categories: programming
related_publications: true
tikzjax: true
---

# [draft] SCoPing SNAP

This post describes my (ultimately failed) attempts to run [Tadashi](/projects/tadashi) {% cite vatai2024tadashi %} on [SNAP](https://github.com/lanl/SNAP).

In the search for realistic apps I wrote `scop_detector`, a very simple program which would run PET's automatic scop detection algorithm on any given ~.c~ file, and print out the found schedule trees. 
