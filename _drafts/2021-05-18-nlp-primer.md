---
title: "NLP primer"
date: 2021-05-18 23:41:00 +0900
categories: programming
---
# Abstract (aka TL;DR:)
This post is an attempt to document the steps I did while trying to
train word embedding using the word2vec algorithm using the Pytorch
framework (and consequently to provide instructions for others trying
to follow in my footsteps - which I'm still not sure if I recommend).

## Overview
1. Getting a corpus
2. Implementation in pytorch
3. Evaluation

# Getting a corpus

## Downloading Wikipedia

Get the **enwiki** dump (or the dump for some other language XX from
XXwiki) from here: https://dumps.wikimedia.org/backup-index.html,

```
wget https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles-multistream.xml.bz2
```

## Extracting Wikipedia

wikiextractor $INPUT \
       --processes 4 \
       --output $OUTPUT \
       --bytes 200M \
       --no-templates
