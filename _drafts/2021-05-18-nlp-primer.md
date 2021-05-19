---
title: "NLP primer"
date: 2021-05-18 23:41:00 +0900
categories: programming
---
# Abstract
Todo

# Getting Wikipedia

## Downloading Wikipedia

Get the =enwiki= dump (or the dump for some other language XX from
XXwiki) from here: https://dumps.wikimedia.org/backup-index.html,

## Extracting Wikipedia

wikiextractor $INPUT \
       --processes 4 \
       --output $OUTPUT \
       --bytes 200M \
       --no-templates
