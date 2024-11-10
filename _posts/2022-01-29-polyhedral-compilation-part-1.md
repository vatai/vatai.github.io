---
layout: post
giscus_comments: true
title: "Polyhedral compilation: part 1"
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

- **The input** is source code with "nice" loops (where "nice" means
  that the loops satisfy such properties, that they are simple enough
  to be handled by ILPs).
- Problem/step 1: Finding the "nice" loops in the source code. This
  is handled by [Polyhedral Extraction Tool
  (PET)](https://repo.or.cz/w/pet.git) which extracts affine
  description of the source code into
  [ISL](https://repo.or.cz/w/isl.git) objects (named integer tuple
  sets/relations etc.). The loops in the source code can be marked
  with `scop` and `endscop` `#pragma`s or PET also has an auto-detect
  feature.
- Problem/step 2: Find or approximate the dependencies in the code.
- **Problem/step 3**: Formulate an ILP, which describes the
  statements from in step 1 and the dependencies from step 2. Given
  an optimisation objective, the ILP can be solved to find an
  **(optimal) schedule**.
- Problem/step 4: Based on the schedule obtained in the previous step
  **generate** (improved) source code
- **The output** is a source code with optimised loops.

This post only addresses (the first half) of **Problem/step 3**.

# Example code: matrix vector product

```C
for (i = 0; i <= n; i++) {
S1: a[i] = 0.0;
    for (j = 0; j <= n; j++)
S2:   a[i] += b[j] * M[i][j];
}
```

The above code has two relevant **statements** which access the
memory: `a[i] = 0.0;` labelled as $S_1$ and `a[i] += b[j] * M[i][j];`
labelled as $S_2$. Each of the two statements is executed multiple
times, it has multiple **instances**, for example the instances of
statement $S_1$ are:

- `a[0] = 0.0;` for $i = 0$,
- `a[1] = 0.0;` for $i = 1$ etc.

Since instances may need to be described by multiple loop variables,
we adopt the notation $\vec{i}$ for **vectors in the iteration
space**, vectors with integer entries, such that the first element
corresponds to the outermost and the last to the innermost loop
variable. For example

- `a[0] += b[1] * M[0][1];` for $\vec{i} = (i, j) = (0, 1)$ and
- `a[2] += b[3] * M[2][3];` for $\vec{i} = (i, j) = (2, 3)$.

# Describing dependencies

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

The GDG is structured: the vertices in GDG are statements, and these
statements represent multiple instances, but we actually care about
the dependencies between the instances. For this reason the Detailed
Dependency Graph "flattens" the graph, and every vertex is an instance
of a statement, and the edges are the dependencies between these
instances.

### Vertices

$$
\Omega = \bigcup _{S \in V} \{ (S, \vec{i}) : \vec{i} \in \mathscr{D}
_S \}
$$

### Edges

$$
\Gamma = \bigcup _{e \in E} \bigl\{ \bigl( (\sigma(e), \vec{i'}),
(\delta(e), \vec{i}) \bigr) : \vec{i'} \in \mathscr{D} _{\sigma(e)},
\vec{i} \in \mathscr{D} _{\delta(e)}, (\vec{i'}, \vec{i}) \in
\mathscr{R}_e \bigr\}
$$

where the statement $\sigma(e)$ is the start, statement $\delta(e)$ is
the end of edge $e$ (of the GDG).

# Schedule

The schedule is a map $\theta: \Omega \to \mathbb{R}_0^+$ from the set
of instances to some non-negative value which is the "date" (or
timestamp, or time) of the instance.

## Generating code

As mentioned above, generating code is a separate, and very much
non-trivial problem. But to get a better feeling how to interpret the
schedule $\theta$ a simplified code generations is presented:

Let $\mathtt{F}(t) = \\{ (S, \vec{i}) \in \Omega: \theta(S, \vec{i}) =
t \\}$, i.e. the set of all instances of all statements which should
be executed at time step $t$. Let $\mathtt{L} = \max_{(S, \vec{i})
\in \Omega} \theta(S, \vec{i})$.

```C++
for (t = 0; t <= L; t++) {
  #pragma omp parallel
  for (inst : F(t))
    execute(inst);
  barrier();
}
```

Of course, actual code generation is a much harder task than this
naive pseudo-code, but it can be handled separately, the objective of
this now is how to obtain the optimal schedule.

## There is (no) optimal schedule

The paper cites Theorems which say that finding a schedule **of
arbitrary form** is an undecidable problem. Because of this, we
restrict ourselves to **affine schedules**, that is schedules of the
form: $$\theta(S, \vec{i}) = \tau_S \vec{i} + \sigma_s \vec{n} +
\alpha_s$$ for each statement $S$. The vector $\vec{n}$ is the vector
of parameters, for the example above the vector of length 1 containing
$n$. In this case the triplet $(\tau_S, \sigma_S, \alpha_S)$
completely define $\theta$ (for a given $S$), so the goal is finding a
$(\tau_S, \sigma_S, \alpha_S)$ triplet for each statement $S$.

# More advanced dependency analysis

## Depth

Descriptions such as GDG and DDG can enable some optimisations.

The **depth** of an edge is the position until which both instances at
the start and the end of the edge share values, and after which the
end instance has a larger value, that is $p_ e$ is the depth of edge
$e$ iff $(\vec{i'}, \vec{i}) \in \mathscr{R} _ e$ and $i'_ k = i_ k$ for
$1 \le k \le p_ e$ and $i'_ {p_ e} < i_ {p_ e}$ where $\vec{i'} =
(i'_ 1, i'_ 2, \ldots)$ and $\vec{i} = (i_ 1, i_2, \ldots)$.

In the example, both edges of the GDG have depth 1:

- $\mathscr{R}_{1, 2} = \\{ \bigl( i', (i, j) \bigr) : i' = i \\}$
- $\mathscr{R}_{2, 2} = \\{ \bigl( (i', j'), (i, j) : i' = i \land j'
  < j \\}$

In both cases the $i'=i$ part implies depth $p_e \ge 1$ and the rest
ensures $p _e \le 1$.

This can be used to infer, that we are allowed to execute the
outermost loop in parallel.

## Dependence direction vectors

A more detailed description of the dependencies can be given using
symbols such as $<, \le, =, *, \ldots$ combined in a **dependence
direction vector** (the asterisk denotes a wildcard, meaning any
relation). Depth can be expressed with DDVs as

$$(\overbrace{=, \ldots, =}^{p_e}, <, *, \ldots)$$

## Uniform dependence

The case where there is a constant difference between the instances of
both ends of an edge, that is when $i' = i + d$ if $(i', i) \in
\mathscr{R}_ e$, the edge $e$ is said to have a **uniform
dependence**. In this case, instead of keeping track of $\mathscr{D}_
{\sigma(e)}$, $\mathscr{D}_ {\delta(e)}$ and the set of $(\vec{i'},
\vec{i})$ pairs, we can just keep track of a single set (polyhedron)
of instances $\mathscr{P}_ e$ and a affine map $h_ e$ such that $y \in
\mathscr{P}_ e \implies y \in \mathscr{D}_ {\delta(e)} \land h_e(y)
\in \mathscr{D} _{\sigma(e)}$ and then

$$
(\vec{i'}, \vec{i}) \in \mathscr{R}_ e \iff \vec{i'} = h_ e(\vec{i})
\land \vec{i} \in \mathscr{P}_e
$$

A more detailed analysis shows that the second edge of our example has
such a uniform dependency.

## Dataflow analysis

A little more advanced (but still very much conservative) dataflow
analysis can further restrict the polyhedrons $\mathscr{R} _{1, 2}$
and $\mathscr{R} _{2, 2}$. The analysis of the memory reads and
writes tells us that only the entries of `a[i]` updated, they are
updated independently for each index $i$, and making no assumptions
about the `+` operation (such as associativity, which _could_ be used
for further optimisations), we observe that

- `a[i]` is initialised in statement $S_ 1$ and only the first
  iteration of the $j$ loop depends on it: $\bigl(i', (i, j) \bigr)
  \in \mathscr{R}_ {1,2} \iff i' = i \land j = 0$ (I think there is a
  typo in the paper saying $j = 1$?). This is reduced as:

  $$
  \mathscr{P}_ {e _1} = \mathscr{D}_2 \cap \{ (i, j) : j \le 0 \},
  \quad h _{e _1}(i, j) = i
  $$

- `a[i]` is updated with each iteration of $j$, so every iteration
  (instance) of $j$ depends only on the previous iteration ($j - 1$),
  and this only applies starting from the second iteration ($j \ge
  1$): $\bigl( (i', j'), (i, j) \bigr) \in \mathscr{R} _{2,2} \iff i'
  = i \land j' = j - 1 \land j \ge 1$ (Again, this might be a typo $j
  \ge 2$ in the paper?) This is reduced as:

  $$
  \mathscr{P} _{e _2} = \mathscr{D} _2 \cap \{ (i, j) : j \ge 1 \},
  \quad h _{e _2}(i, j) = (i, j - 1)
  $$

We will continue with these reduced forms.

# Formulating the integer linear program

## Describing vertices/domains

The $\mathscr{D}_ S$ domains (including the parameters, represented as
$\vec{n}$) need to be rewritten in the form where given the parameters
$\vec{n}$ the instance $\vec{i}$ is in domaind $\mathscr{D} _S$ iff:

$$
a_{S_k} \begin{pmatrix} \vec{i} \\ \vec{n} \end{pmatrix} + b_{S_k}
\ge 0 \quad (\forall k=1, \ldots m_S)
$$

This way, the $(a_ {S_ k}, b_ {S_ k})$ pairs completely describe
$\mathscr{D} _S$ (that is, you can use these vectors to represent them
in a computer program).

$$
\begin{align}
\mathscr{D}_1 &= \{ i : 0 \le i \le n \} \\&= \{ i : 0 \le i \land 0 \le
n - i \} \\
\mathscr{D}_2 &= \{ (i, j) : 0 \le i, j \le n \} \\ &= \{ (i, j) : 0 \le
i \land 0 \le n - i \land 0 \le j \land 0 \le n - j \}
\end{align}
$$

In the example of $\mathscr{D} _1$ there are two inequalities, implying
$m _1 = 2$:

$$0 \le i = (1, 0) \begin{pmatrix} i \\ n \end{pmatrix} + 0$$

implies $a _{S _1} = (1, 0)$ and $b _{S _1} = 0$ and

$$0 \le n - i = (-1, 1) \begin{pmatrix} i \\ n \end{pmatrix} + 0$$

implies $a _{S _2} = (-1, 1)$ and $b _{S _2} = 0$.

Domain $\mathscr{D} _2$ can be described with $m _2 = 4$ such
equations.

## Describing edges/dependencies

The edges $\mathscr{R}_ e$ of the GDG is described by $(c_e, d_e)$
such that:

$$
c _{e _k} \begin{pmatrix} \vec{i'} \\ \vec{i} \\ \vec{n}
\end{pmatrix} + d_ {e_k} \ge 0 \quad (\forall k=1, \ldots m _e)
$$

or for a restricted schedule with the affine map $\vec{i'} =
h_e(\vec{i})$ and the rewritten reduced domain $\mathscr{P} _e$:

$$
c_{e_k} \begin{pmatrix} \vec{i} \\ \vec{n} \end{pmatrix} + d_{e_k}
\ge 0 \quad (\forall k=1, \ldots m_S)
$$

The reduced domains $\mathscr{P} _{e _1}$ and $\mathscr{P} _{ e _2}$
can be described similarly as the other domains $\mathscr{D} _1$ and
$\mathscr{D} _2$.

## Describing schedules

The schedule $\theta(S, \vec{i})$ is also going to be rewritten using
a set of $\mu$ Farkas multipliers. For each statement $S$ we assume
that the schedule can be expressed as:

$$
\theta(S, \vec{i}) \equiv \mu_{S_0} + \sum_{k=1}^{m_S} \mu_{S_k}
\Bigl( a_{S_k} \begin{pmatrix} \vec{i} \\ n \end{pmatrix} + b_{S_k}
\Bigr)
$$

This captures the information provided by the domains $\mathscr{D} _S$
captured in the ($m _S$ number of) $(a _{S _k}, b _{S _k})$ pairs. To
combine this with the information from the dependencies/edges we will
need the _delay_ corresponding to the edges.

## The delay

We assume that if the instance $\vec{i}$ of a statement $S$ depends on
the instance $\vec{i'}$ of the statement $S'$, then there is a
**delay** $\Delta$ associated with that dependency/edge $e$. This
means that the date of $S, \vec{i}$ assigned by the schedule $\theta$
is greater (by at least $1$) than the date of $S', \vec{i'}$:

$$\Delta = \theta(S, \vec{i}) - \theta(S', \vec{i'}) - 1 \ge 0$$

We assume that this delay can be rewritten with a different set of
$\lambda$ Farkas multipliers (these will be just placeholders to
express dependencies between inequalities across inequalities
resulting from the dependencies/edges).

$$
\Delta \equiv \lambda_{e_0} + \sum_{k=1}^{m_e} \lambda_{e_k} \Bigl(
c_{e_k} \begin{pmatrix} \vec{i} \\ n \end{pmatrix} + d_{e_k} \Bigr)
$$

# Putting it all together

The $\equiv$ in the last equation was alluding to the next step where
we combine the "$\theta$ equations" expressing the domains and the
"$\Delta$ equations" expressing the dependencies.

$$\theta(S, \vec{i}) - \theta(S', \vec{i'}) - 1 \equiv \Delta \ge 0$$

On the left side of $\equiv$ in the expression above we use two
instances of the "$\theta$ equations" (with $a _S{ _k}$, $b _S{ _k}$
and $\mu _S{ _k}$), on the right "$\Delta$ equations" (with $c _{e
_k}$, $d _{e _k}$ and $\lambda _{e _k}$) and solve the ILP for the
$\mu _{S _k}$ variables (for each statement $S$).

## Edge $e_1 : 1 \to 2$

For the first edge $e _1$ between statement $S_1$ to $S_2$ the
equations from above give rise to the following

$$
\begin{align*}
    &\bigl[\mu_{2, 0} + \mu_{2, 1} i + \mu_{2, 2} (n - i) + \mu_{2, 3} j + \mu_{2, 4} (n - j) \bigr] \\
    -& \bigl[\mu_{1, 0} + \mu_{1, 1} i + \mu_{1, 2} (n - i) \bigr] - 1 \\
    \equiv& \lambda_{1, 0} + \lambda_{1, 1} i + \lambda_{1, 2} (n - i) + \lambda_{1, 3} j + \lambda_{1, 4} (n - j) - \lambda_{1, 5} j \ge 0
\end{align*}
$$

The first and second line (except the $-1$ at the end of it) of the
ILP come from the rewritten form of $\mathscr{D}_2$ and
$\mathscr{D}_1$ from the [Describing
vertices/domains](#describing-verticesdomains) section, plugged in the
"$\Theta$ equation", while the third line is the result of taking
$\mathscr{P} _{e _1}$ [Dataflow analysis](#dataflow-analysis), which
is $-j \ge 0$ and the inequalities from the $\mathscr{D} _2$ (hence
the similarity to the first line).

The previous equation is equivalent to the following system of
equations by equating the coefficients of $i$, $j$, $n$ and the
constant term.

$$
\begin{align}
    \mu_{2, 0} - \mu_{1, 0} - 1 &= \lambda_{1, 0} &\text{const. terms}\\
    \mu_{2, 1} - \mu_{2, 2} - \mu_{1, 1} + \mu_{1, 2} &= \lambda_{1, 1} - \lambda_{1, 2} &\text{$i$ terms}\\
    \mu_{2, 3} - \mu_{2, 4} &= \lambda_{1, 3} - \lambda_{1, 4} - \lambda_{1, 5} &\text{$j$ terms}\\
    \mu_{2, 2} + \mu_{2, 4} - \mu_{1, 2} &= \lambda_{1, 2} + \lambda_{1, 4} &\text{$n$ terms}
\end{align}
$$

## Edge $e_2 : 2 \to 2$

The second edge is a [uniform dependency](#uniform-dependence), the
schedule for the start and end of the edge, $\theta(S _2, h(\vec{i}))$
and $\theta(S _2, \vec{i})$ is nearly identical (difference
highlighted in the formulae below).

$$
\mu_{S_0} + \sum_{k=1}^{m_S} \mu_{S_k} \bigl( a_{S_k}
(\begin{smallmatrix} {\color{magenta}{\vec{i}}} \\ n
\end{smallmatrix}) + b_{S_k} \bigr) - \bigl[ \mu_{S_0} +
\sum_{k=1}^{m_S} \mu_{S_k} \bigl( a_{S_k} (\begin{smallmatrix}
\color{magenta}{h(\vec{i})} \\ n \end{smallmatrix}) + b_{S_k} \bigr)
\bigr]
$$

This results to most of the terms
cancelling each other out in the expression $\theta(S _2, \vec{i}) -
\theta(S _1, h(\vec{i}))$ (written with the $\mu _{S _k}$ Farkas
multipliers):

$$
\mu_{S_0} + \sum_{k=1}^{m_S} \mu_{S_k} \bigl( a_{S_k}
\Bigl(\begin{smallmatrix} i \\ j \\ n \end{smallmatrix}\Bigr) +
b_{S_k} \bigr) - \bigl[ \mu_{S_0} + \sum_{k=1}^{m_S} \mu_{S_k} \bigl(
a_{S_k} \Bigl(\begin{smallmatrix} i \\ j \color{magenta}{-1} \\ n
\end{smallmatrix}\Bigr) + b_{S_k} \bigr) \bigr]
$$

<!-- The remaining term is $$- \sum _{k=1}^{m _S}. -->
<!-- \mu_{S_k} a_{S_k} \Bigl( \begin{smallmatrix} 0 \\ -1 \\ 0 -->
<!-- \end{smallmatrix} \Bigr)$$ -->

<!-- Concretely: $\theta(2, i, j) = \cdots -->
<!-- \mu_{2, 3} j + \mu_{2, 4} (n - j)$ implies $\theta(2, y) - -->
<!-- \theta(2, h(y)) = \theta(2, i, j) - \theta(2, i, j - 1) = \mu_{2, -->
<!-- 3} - \mu_{2, 4}$ -->

As a result, the loop edge on $S _2$ results in the following equation
(not the lack of $\lambda _{S _k}$ multipliers).

$$\Delta = \theta(S _2, i, j) - \theta(S _2, i, j - 1) - 1 = \mu_{2, 3} - \mu_{2, 4} - 1 \ge 0$$

## The calculations

Collecting and rearranging the inequalities for $e _1 : S _1 \to S
_2$ and $e _2 : S _2 \to S _2$.

$$
\begin{align}
    \lambda_{1, 0} =& \mu_{2, 0} - \mu_{1, 0} - 1 \ge 0 \\
    \lambda_{1, 1} =& \mu_{2, 1} + \mu_{2, 4} - \mu_{1, 1} - \lambda_{1, 4} \ge 0 \\
    \lambda_{1, 3} =& \mu_{2, 3} - \mu_{2, 4} - \lambda_{1, 4} - \lambda_{1, 5} \ge 0 \\
    \lambda_{1, 2} =& \mu_{2, 2} + \mu_{2, 4} - \mu_{1, 2} - \lambda_{1, 4} \ge 0 \\
    & \mu_{2, 3} - \mu_{2, 4} - 1 \ge 0
\end{align}
$$

Simplifying it gives:

$$
\begin{align*}
    \mu_{2, 0} - \mu_{1, 0} - 1 \ge& 0 \\
    \mu_{2, 3} - \mu_{2, 4} - 1 \ge& 0 \\
    \mu_{2, 3} + \mu_{2, 4} - \mu_{1, 1} \ge& 0 \\
    \mu_{2, 2} + \mu_{2, 4} - \mu_{1, 2} \ge& 0
\end{align*}
$$

All these manipulations can be performed by algorithms automatically.

## One possible result

One valid choice for the $\mu _{S _k}$ values is:

- $\mu_{1, 0} = \mu_{2, 1} = \mu_{2, 2} = \mu_{2, 4} = \mu_{1, 1} = \mu_{1, 2} = 0$
- $\mu_{2, 0} = \mu_{2, 3} = 1$
- $\theta(1, i) = 0$
- $\theta(2, i, j) = j + 1$

## Generated code

The resulting schedule is:

- $\theta(S _1, i) = 0$
- $\theta(S _2, i, j) = j + 1$

Generating code from this is a separate task and will be disucussed in
the next blog post, but the paper suggests something similar to:

```C++
#pragma omp parallel
for (i = 0; i <= n; n++)
  a[i] = 0.0;
for (j = 0; j <= n; j++)
  #pragma omp parallel
  for (i = 0; i <= n; i++)
    a[i] += b[j] * M[i][j];
```

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

Feedback is very much welcome. I don't have a comment section set up,
but you can raise an
[issue](https://github.com/vatai/vatai.github.io/issues) on GitHub.
