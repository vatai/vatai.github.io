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

$$\lambda = i + \frac{j(j - 1)}{2} = i + \sum_{t=1}^{j-1} t$$

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

Because $$\lambda \mapsto j(\lambda) = \lfloor \sqrt{1/4 + 2 \lambda} + 1/2 \rfloor$$ is monotonically increasing (non-decreasing), returning the $$\lfloor \cdot \rfloor$$ means that $$j$$ is the largest possible integer such that $$\lambda = i + \frac{j(j - 1)}{2}$$ for a non-negative integer $$i$$.

According to {% cite dash2021scaling alhajri2020identifying %} this flattened $$\lambda$$ loop corresponds to the following $$i$$ and $$j$$ loop:

```python
N = 5
count = 0
for i in range(N):
    for j in range(i+1, N):
        count += 1
        print(count, ":", i,j)
```

```
1 : 0 1
2 : 0 2
3 : 0 3
4 : 0 4
5 : 1 2
6 : 1 3
7 : 1 4
8 : 2 3
9 : 2 4
10 : 3 4
```

If we implement the flattened loop we see that this is only true in the sense that the set of visited combination is the same, however, the order is different.

```python
import math

N = 5
Nc2 = 10
count = 0
for L in range(Nc2):
    j = math.floor(math.sqrt(0.25 + 2*L) + 0.5)
    i = L - j*(j-1)//2
    count += 1
    print(count, ":", i, j)
```

```
1 : 0 1
2 : 0 2
3 : 1 2
4 : 0 3
5 : 1 3
6 : 2 3
7 : 0 4
8 : 1 4
9 : 2 4
10 : 3 4
```

So to generate the combinations in the same order as the initial $$i$$, $$j$$ loops, we need to modify the code as follows:

```python
import math

N = 5
Nc2 = 10
count = 0
for L in reversed(range(Nc2)):
    j = math.floor(math.sqrt(0.25 + 2*L) + 0.5)
    i = L - j*(j-1)//2
    count += 1
    print(count, ":", N - 1 - j, N - 1 - i)
```

```
1 : 0 1
2 : 0 2
3 : 0 3
4 : 0 4
5 : 1 2
6 : 1 3
7 : 1 4
8 : 2 3
9 : 2 4
10 : 3 4
```

Or alternatively, if we want to modify the original $$i$$, $$j$$ loop to match the $$\lambda$$ loop and the mathematical derivation:


```python
N = 5
count = 0
for j in range(N):
    for i in range(0, j):
        count += 1
        print(count, ":", i, j)
```

```
1 : 0 1
2 : 0 2
3 : 1 2
4 : 0 3
5 : 1 3
6 : 2 3
7 : 0 4
8 : 1 4
9 : 2 4
10 : 3 4
```

