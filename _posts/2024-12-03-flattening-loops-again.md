---
layout: post
giscus_comments: true
title: "[DRAFT] Flattening loops of combinations, again!?"
date: 2024-12-03 09:00:00 +0900
categories: programming
related_publications: true
tikzjax: true
---

We had problems implementing the 3x1 flattened four nested loops
generating 4-combinations in {% cite dash2021scaling %}.

$$
\begin{align*}
  q &\gets (\sqrt{729 \lambda^2 -3} + 27 \lambda)^{1/3} \\
  k &\gets \lfloor (q/3^2)^{1/3} + 1/(3q)^{1/3} - 1 \rfloor \\
  T_z &\gets k (k + 1) (k + 2) / 6 \\
  \lambda' &= \lambda - T_z \\
  j &\gets \lfloor \sqrt{1/4 + 2\lambda'} -1/2 \rfloor \\
  i &\gets \lambda' - j (j + 1) / 2
\end{align*}
$$