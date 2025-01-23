---
layout: post
giscus_comments: true
title: "Making Tadashi into a Python package"
date: 2025-01-04 09:00:00 +0900
tag: tadashi
categories: programming
related_publications: true
tikzjax: true
---


# The current situation

Currently, to run Tadashi, you need to compile some .so files first
with CMake. It needs to be built into the `build` directory under the
project root. Finally, adding the project root to `PYTHONPATH` will
allow python to find both the python files and the binary .so files.

## SWIG

First thing to clean up was implementing SWIG instead the ad-hoc CDLL
approach currently used to call the C/C++ functions from Python. CDLL
takes the path of the .so file, which is hard-coded in the Python
files (hence the ad-hoc character of the implementation). Also, the
arguments and return values of the functions of the .so files which
are exposed to Python need to be copied from the .h files manually
with CDLL.

The SWIG implementation has the following advantages:

- The arguments and return values of the functions are automagically
  generated based on the .h files, thus letting us have a single
  source of truth (well, technically two, since the function
  prototypes in .h and .cc need to be synced manually, but the
  compiler catches any discrepancies).
- SWIG generates the wrapper Python file in the same directory as the
  .so file (as part of the build process), eliminating the need to
  manually specify the path to the .so.

---

- Python package
- cmake-build-extension

# The new problems

---
