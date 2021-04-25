---
title: "Index substitution"
date: 2021-04-24 22:45:00 +0900
categories: math
usemathjax: true
---

# The easy problem

Using the identity
$$\begin{equation}
S = \sum_{i=0}^{n} \sum_{j=0}^{i} a_i a_j
= \sum_{i=0}^{n} \sum_{j=i}^{n} a_i a_j \\
\end{equation}$$
We get
$$\begin{align}
2 S
&= \sum_{i=0}^{n} \Bigl(\sum_{j=0}^{i} a_i a_j + \sum_{j=i}^{n} a_i a_j \Bigr) \\
&= \sum_{i=0}^{n} \Bigl(\sum_{j=0}^{n} a_i a_j + a_i^2 \Bigr) \\
&= \sum_{i=0}^{n} \sum_{j=0}^{n} a_i a_j + \sum_{i=0}^{n} a_i^2 \\
&= \Bigl( \sum_{i=0}^{n} a_i \Bigr)^2 + \sum_{i=0}^{n} a_i^2 \\
\end{align}$$

# The harder problem

$$\begin{align}
\sum_{i=0}^{n} \sum_{j=0}^{i} \sum_{k=0}^{j} a_i a_j a_k 
=& \sum_{i=0}^{n} \sum_{j=i}^{n} \sum_{k=0}^{j} a_i a_j a_k \\
=& \frac{1}{2} \sum_{i=0}^{n} \Bigl( \sum_{j=0}^{i} \sum_{k=0}^{j} a_i a_j a_k + \sum_{j=i}^{n} \sum_{k=0}^{j} a_i a_j a_k \Bigr) \\
=& \frac{1}{2} \sum_{i=0}^{n} \Bigl( \sum_{j=0}^{n} \sum_{k=0}^{j} a_i a_j a_k + \sum_{k=0}^{i} a_i^2 a_k \Bigr) \\
=& \frac{1}{2} \sum_{i=0}^{n} \sum_{j=0}^{n} \sum_{k=0}^{j} a_i a_j a_k \\
&+ \frac{1}{2} \sum_{i=0}^{n} \sum_{k=0}^{i} a_i^2 a_k \\
=& \frac{1}{4} \sum_{i=0}^{n} \sum_{j=0}^{n} \Bigl( \sum_{k=0}^{n} a_i a_j a_k + a_i a_j^2 \Bigr) \\
&+ \frac{1}{4} \sum_{i=0}^{n} \Bigl( \sum_{k=0}^{n} a_i^2 a_k + a_i^3 \Bigr) \\
=& \frac{1}{4} \sum_{i=0}^{n} \sum_{j=0}^{n} \sum_{k=0}^{n} a_i a_j a_k + \frac{1}{4} \sum_{i=0}^{n} \sum_{j=0}^{n} a_i a_j^2 \\
&+ \frac{1}{4} \sum_{i=0}^{n} \sum_{k=0}^{n} a_i^2 a_k + \frac{1}{4} \sum_{i=0}^{n} a_i^3
\end{align}$$

Then by the solution is $\frac{1}{4} S_1^3 + \frac{1}{2} S_1^2 S_2 +
\frac{1}{4} S_3$ where $S_r = \sum_{i=0}^n a_i^r$, but it should be:
$\frac{1}{6} S_1^3 + \frac{1}{2} S_1^2 S_2 + \frac{1}{3} S_3$.
