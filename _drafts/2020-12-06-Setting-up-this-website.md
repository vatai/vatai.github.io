---
title: "How to set up a website like this"
date: 2020-12-06 12:32:00 -0000
categories: tutorial
---

- TODO: Add links where possible.

## TL;DR:
Describe how to set up a website/microblog like this one, which is
basically a Jekyll website, using the Minimal-mistakes theme.


## Introduction
Github pages (simple HTML) with Jekyll is super simple to set up, but
the themes and the basic built-in stuff is relatively limited and
Minimal-mistakes is a good theme to add a bunch of extra stuff to your
website/microblog/whatever you want to call it.

### Jekyll
As I understand it, **Jekyll** is like a build system, whitch "put's
it all together" and generates the static `.html` pages, so Jekyll's
documentation is what you should most probably be reading.

### Liquid
Liquid is the template language, which ties the data from the Jekyll
to the webpages, see the category setup as an example.  Liquid is
applied independently to both `.md` and `.html` files.  See LINK TO
JEKYLL docs about rendering.

## Jekyll basics
Lessons I've learned about Jekyll, which I feel stupid I missed.

### Minimal mistakes
### Configuration file
The main configuration file is `_config.yml`.
### Front matter
Front matter is (to the best of my knowledge) a Jekyll concept and looks something like this:
```
---
title: "How to set up a website like this"
categories: tutorial
layout: post
---
```
It has to
- be at the beginning of the file;
- start with the line containing `---` and nothing else,
- which is followed by key value pairs (one per each line), separated
  by a colon `:`; and finally
- end with the line containing only `---`.

Front matter applies to `.md` files (maybe to `.html` files as well - need to check).

TODO
- Mathjax
- Not sure about `Gemfile`.
- `jekyll serve --drafts --incremental --livereload` localhost, not https, port: 4000
- Categories
- Ruby, bundler and github pages
