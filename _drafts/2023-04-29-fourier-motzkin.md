---
title: "Fourier-Motzking"
date: 2023-04-29 11:09:00 +0900
categories: polyhedral math
usemathjax: true
---

```python
%display latex
lmbda = [var(f"lambda_{i}") for i in range(6)]
ci, cj = var("c_i c_j")
symvars = var("N i j");
```

```python
LHS = (ci - cj)*i + (cj - ci)*j
rhs_coeffs = [1, N-i, N-j, j-i-1, i-1, j-1]
RHS = sum([lmbda[i] * coeff for i, coeff in enumerate(rhs_coeffs)])
LHS == RHS
```

<html>\(\displaystyle {\left(c_{i} - c_{j}\right)} i - {\left(c_{i} - c_{j}\right)} j = {\left(N - i\right)} \lambda_{1} + {\left(N - j\right)} \lambda_{2} - {\left(i - j + 1\right)} \lambda_{3} + {\left(i - 1\right)} \lambda_{4} + {\left(j - 1\right)} \lambda_{5} + \lambda_{0}\)</html>

```python
def get_eqns(LHS, RHS):
    RHS = RHS.expand()
    eqns = []
    for sv in symvars:
        lhs = LHS.coefficient(sv)
        rhs = RHS.coefficient(sv)
        eqns.append(lhs==rhs)
        # print(f"{sv}: {lhs==rhs}")
        LHS = LHS.expand() - (sv * lhs).expand()
        RHS = RHS.expand() - (sv * rhs).expand()

    # print(f"const: {LHS.simplify()==RHS.simplify()}")
    eqns.append(LHS==RHS)
    return eqns


def addeq(eqns, idx, term):
    l = eqns[idx].lhs()
    r = eqns[idx].rhs()
    eqns[idx] = l + term == r + term


def combeqs(eq1, eq2):
    lhs = eq1.lhs() + eq2.lhs()
    rhs = eq1.rhs() + eq2.rhs()
    return lhs == rhs
```

```python
eqns = get_eqns(LHS, RHS)
eqns
```

<html>\(\displaystyle \left[0 = \lambda_{1} + \lambda_{2}, c_{i} - c_{j} = -\lambda_{1} - \lambda_{3} + \lambda_{4}, -c_{i} + c_{j} = -\lambda_{2} + \lambda_{3} + \lambda_{5}, 0 = \lambda_{0} - \lambda_{3} - \lambda_{4} - \lambda_{5}\right]\)</html>

```python
eqns[0]
```

<html>\(\displaystyle 0 = \lambda_{1} + \lambda_{2}\)</html>

```python
addeq(eqns, 0, -lmbda[1])
eqns[0]
```

<html>\(\displaystyle -\lambda_{1} = \lambda_{2}\)</html>

```python
eqns[1]
```

<html>\(\displaystyle c_{i} - c_{j} = -\lambda_{1} - \lambda_{3} + \lambda_{4}\)</html>

```python
eqns[1] = eqns[1].subs(eqns[0])
eqns[1]
```

<html>\(\displaystyle c_{i} - c_{j} = \lambda_{2} - \lambda_{3} + \lambda_{4}\)</html>

```python
eqns[1] = combeqs(eqns[1], eqns[2]);
eqns[1]
```

<html>\(\displaystyle 0 = \lambda_{4} + \lambda_{5}\)</html>

```python
addeq(eqns, 1, -lmbda[4])
eqns[1]
```

<html>\(\displaystyle -\lambda_{4} = \lambda_{5}\)</html>

```python
eqns[3] = eqns[3].subs(eqns[1].lhs() == eqns[1].rhs())
eqns[3]
```

<html>\(\displaystyle 0 = \lambda_{0} - \lambda_{3}\)</html>

```python
addeq(eqns, 3, lmbda[3])
eqns[3]
```

<html>\(\displaystyle \lambda_{3} = \lambda_{0}\)</html>

```python
eqns[2] = eqns[2].subs(eqns[0].rhs() == eqns[0].lhs())
```

```python
for e in eqns:
    print(e)
```

    -lambda_1 == lambda_2
    -lambda_4 == lambda_5
    -c_i + c_j == lambda_1 + lambda_3 + lambda_5
    lambda_3 == lambda_0

$0 \le \lambda_1$ and $\lambda_1 = - \lambda_2$ implies $0 \le -\lambda_2$ which is equivalent to $0 \ge \lambda_2$ with $0 \le \lambda_2$ we get $\lambda_2 = 0$ and $\lambda_1 = -\lambda_2 = 0$.

Similarly, from $\lambda_4 = -\lambda_5$, $0 \le \lambda_4$ and $0 \le \lambda_5$ we get $\lambda_4 = \lambda_5 = 0$.

Substituting these results into equation 2, we get:

```python
eqns[2] = eqns[2].subs({lmbda[1]: 0, lmbda[5]: 0})
eqns[2]
```

<html>\(\displaystyle -c_{i} + c_{j} = \lambda_{3}\)</html>

which means:

```python
eqns[2].lhs() >= 0
```

<html>\(\displaystyle -c_{i} + c_{j} \geq 0\)</html>

```python

```
