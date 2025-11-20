---
layout: post
giscus_comments: true
title: [DRAFT] Tadashi with Cython
date: 2025-11-20 21:00:00 +0900
tag: tadashi
categories: programming
related_publications: true
description: Plans about how to port Tadashi to Cython
featured: true
mermaid:
  enabled: true
  zoomable: false
---

```mermaid
sequenceDiagram
  ml_model.py->>PETApp: source
  PETApp->>BaseApp: puplate_scops()
  ml_model.py->>Ctadashi: transform()
  Ctadashi->>BaseApp: new state
  ml_model.py->>Ctadashi: transform()
  Ctadashi->>BaseApp: new state
  ml_model.py->>Ctadashi: transform()
  Ctadashi->>BaseApp: new state
  ml_model.py-->>BaseApp: reset()
  BaseApp-->>BaseApp: restore state
  ml_model.py->>PETApp: generate_code()
  BaseApp-)PETApp: scops[]
  PETApp->>tapp: new_source.c generate_code()
```
