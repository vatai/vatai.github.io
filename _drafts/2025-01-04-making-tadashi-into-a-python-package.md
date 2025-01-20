---
layout: post
giscus_comments: true
title: "Making Tadashi into a Python package"
date: 2025-01-04 09:00:00 +0900
categories: programming
related_publications: true
tikzjax: true
---

# Motivation: make Tadashi easier to install

How nice it would be to be able to just `pip install tadashi` and have everything working. To have everything working™ now, we at least two steps:

- build the C/C++ code and
- tell Python where it can find the

# The solution

- SWIG
- Python package
- cmake-build-extension

# The new problems
