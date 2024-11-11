---
layout: post
giscus_comments: true
title: "[DRAFT] Flattening loops of combinations"
date: 2024-11-11 09:00:00 +0900
categories: programming
related_publications: true
---

In {% cite dash2021scaling alhajri2020identifying %}, when iterating through all 2-hit combinations (of $$G$$ number of genes), the outer two $$i$$ and $$j$$ loops are "flattened" into a single $$\lambda$$ loop ($$\lambda \gets 1\ldots\binom{G}{2}$$).
To reconstruct the $$i$$ and $$j$$ the following formulas are used:

$$
\begin{align}
  j &= \lfloor \sqrt{1/4 + 2 \lambda} + 1/2 \rfloor \\
  i &= \lambda - j (j - 1) / 2
\end{align}
$$

Let's try to derive those formulas.

It is easy to spot the $$S_{j-1} := \sum_{t=1}^{j-1} t = \frac{j (j - 1)}{2}$$ formula for the sum of all positive integers going up to $$j-1$$. Which leads us to:

$$ \lambda = i + \frac{j(j - 1)}{2} = i + \sum_{t=1}^{j-1} t$$

The same $$S_{j-1}$$ formula is also present in the expression for $$j$$ (we begin by removing the $$\lfloor \cdot \rfloor$$):

$$
\begin{align}
  j &= \sqrt{1/4 + 2 \lambda} + 1/2 \\
  j - 1/2 &= \sqrt{1/4 + 2 \lambda}  \\
  (j - 1/2)^2 &= 1/4 + 2 \lambda \\
  j^2 - j + 1/4 &= 1/4 + 2 \lambda \\
  j^2 - j &= 2 \lambda \\
  \lambda &= \frac{j (j-1)}{2}
\end{align}
$$

This reminds me of division with a reminder, where $$a = q b + r$$ and $$q = \lfloor a / b \rfloor$$
