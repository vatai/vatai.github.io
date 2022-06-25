---
title: "Polyhedral compilation: part 2"
categories: math compsci polyhedral
usemathjax: true
---
# Abstract

This blog posts is the first in a series of posts about **polyhedral
compilation**, a mathematical model used to describe and reason about
certain types of loops, with the aim to generate faster code.

This post revisits ["Some efficient solutions to the affine scheduling
problem. I. One-dimensional time" by Paul
Feautrier](https://link.springer.com/article/10.1007/BF01407835), the
seminal paper of the field, which describes how to _formulate the the
search for an optimal schedule as an integer linear programming (ILP)
problem_.


# Overview of the process

Formulated as a source-to-source compilation, the following steps give
a (_very simplified_) overview of the entire process:

-  **The input** is source code with "nice" loops (where "nice" means
   that the loops satisfy such properties, that they are simple enough
   to be handled by ILPs).
-  Problem/step 1: Finding the "nice" loops in the source code.  This
   is handled by [Polyhedral Extraction Tool
   (PET)](https://repo.or.cz/w/pet.git) which extracts affine
   description of the source code into
   [ISL](https://repo.or.cz/w/isl.git) objects (named integer tuple
   sets/relations etc.). The loops in the source code can be marked
   with `scop` and `endscop` `#pragma`s or PET also has an auto-detect
   feature.
-  Problem/step 2: Find or approximate the dependencies in the code.
-  **Problem/step 3**: Formulate an ILP, which describes the
   statements from in step 1 and the dependencies from step 2.  Given
   an optimisation objective, the ILP can be solved to find an
   **(optimal) schedule**.
-  Problem/step 4: Based on the schedule obtained in the previous step
   **generate** (improved) source code
-  **The output** is a source code with optimised loops.

This post only addresses (the first half) of **Problem/step 3**.


####################################### KEEEP ###############################################

# Citing this blog post

```
@misc{vatai2022polytutor1,
  title={Polyhedral compilation: part 1},
  url={https://vatai.github.io/math/compsci/polyhedral/polyhedral-compilation-part-1/},
  author={Vatai, Emil},
  year={2022},
  month={Feb}
}
```

# Feedback

Feedback is very much welcome.  I don't have a comment section set up,
but you can raise an
[issue](https://github.com/vatai/vatai.github.io/issues) on GitHub.
