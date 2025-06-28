---
layout: post
giscus_comments: true
title: "[draft] SCoP detection"
date: 2025-06-24 09:00:00 +0900
tag: tadashi
categories: programming
related_publications: true
tikzjax: true
---

# SCoP Detection

In the efforts to run [Tadashi](/projects/tadashi) {% cite vatai2025tadashi %} on real world applications we developed `scop_detector` (and the convenience wrapper `scops_in_dir`) to help identify potential apps and/or ROIs.

## SCoP detection in Tadashi

Tadashi extracts SCoPs from source files using PET {% cite verdoolaege2012polyhedral %}.
