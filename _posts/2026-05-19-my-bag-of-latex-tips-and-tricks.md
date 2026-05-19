---
layout: post
giscus_comments: true
title: "My bag of LaTeX tips and tricks"
date: 2026-05-19 09:00:00 +0900
tag: latex
categories: science
related_publications: true
tikzjax: true
---

# This post will be updated

I plan to keep this post as a constantly updating webpage of tips and
tricks I've encountered while writing papers.

## Subfigures for IEEE template

Use the Subcaption

```latex
\usepackage{subcaption
```

with these settings:

```latex
%%IEEE%% The following block of 4 lines makes subcaption behave the way IEEEtran expects it to behave.
\DeclareCaptionLabelSeparator{periodspace}{.\quad} %%IEEE%%
\captionsetup{font=footnotesize,labelsep=periodspace,singlelinecheck=false} %%IEEE%%
\captionsetup[sub]{font=footnotesize,singlelinecheck=true} %%IEEE%%
\renewcommand\thesubfigure{\alph{subfigure}} %%IEEE%%
```

Officially, `subcaption` is not supported by IEEE, but these settings make it appear as it should.
