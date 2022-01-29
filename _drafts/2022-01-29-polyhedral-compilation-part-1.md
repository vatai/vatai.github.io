---
title: "Polyhedral compilation: part 1"
date: 2022-01-29 09:26:00 +0900
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

# Example code: matrix vector product

```C
for (i = 0; i <= n; i++) {
S1: a[i] = 0.0;
    for (j = 0; j <= n; j++)
S2:   a[i] += b[j] * A[i][j];
}
```

The above code has to relevant **statements** which access the memory:
`a[i] = 0.0;` labelled as $S_1$ and `a[i] += b[j] * A[i][j];` labelled
as $S_2$.  Each of the two statements is executed multiple times, it
has multiple **instances**, for example the instances of statement
$S_1$ are:
- `a[0] = 0.0;` for $i = 0$,
- `a[1] = 0.0;` for $i = 1$ etc.

Since instances may need to be described by multiple loop variables,
we adopt the notation $\vec{i}$ for **vectors in the iteration
space**, vectors with integer entries, such that the first element
corresponds to the outermost and the last to the innermost loop
variable.  For example
- `a[0] += b[1] * A[0][1];` for $\vec{i} = (i, j) = (0, 1)$ and
- `a[2] += b[3] * A[2][3];` for $\vec{i} = (i, j) = (2, 3)$.

## Generalised Dependency Graph (GDG)

### Vertices/domains

For each statement $S$ the corresponding **vertex** of the GDG is
labelled with the **domain** (hence the $\mathscr{D}$ notation below)
of the statement $S$, i.e. the subset of the iteration space
containing the instances of $S$ executed by the loop.
- $\mathscr{D}_1 = \\{ i : 0 \le i \le n \\}$ for statement $S_1$
- $\mathscr{D}_2 = \\{ (i, j) : 0 \le i, j \le n \\}$ for statement
  $S_2$

Technically, the domains are not sets, but families of sets, depending
on parameters (in this example on the single parameter $n$), so the
domain for statement 1 is the map $n \mapsto \\{ i : 0 \le i \le n
\\}$, but we omit the "$n \mapsto$" part, and treat $n$ as a constant
(but this will be included in a more).

### Edges/dependencies

The **edges** of GDG are the **dependencies** between two statements
and are labelled with a subset of the direct product (a relation,
hence the $\mathscr{R}$ notation below) between the two domains of
statements of the start and end of the edge, that is, if $S'$ and $S$
are two statements and there is a dependency between the instances
$\vec{i'} \in \mathscr{D}_ {S'}$ and $\vec{i} \in \mathscr{D}_ S$ then
there is and edge from vertex $\mathscr{D}_{S'}$ to $\mathscr{D} _S$
labelled with a set that contains $(\vec{i'}, \vec{i})$.

A simplified (ergo very conservative) dependency analysis (there are
programs which can perform such analysis) could yield two
dependencies:
- $\mathscr{R}_{1, 2} = \\{ \bigl( i', (i, j) \bigr) : i' = i \\}$
  describes the dependency between $S_1$ and $S_2$ which requires for
  the initialisation in $S_1$ (`a[i] = 0.0`) to precede (all instances
  of) statement $S_2$ when the two statements share the same value for
  the loop variable $i$ (hence $i' = i$).
- $\mathscr{R}_{2, 2} = \\{ \bigl( (i', j'), (i, j) : i' = i \land j'
  < j \\}$ describes the dependency of $S_2$ on itself, which
  requires, for a given $i$ ($i' = i$) the earlier instances of (in
  $j$) are executed before the later instances (hence $j' < j$).

This dependency analysis is **very** coarse and/or conservative (read
poor), we'll discuss a simple data flow dependency later (which is
still quite simple, but a slight improvement over the one above).

## Detailed Dependency Graph (DDG)

# Future work
I'm writing this in my attempt to understand
