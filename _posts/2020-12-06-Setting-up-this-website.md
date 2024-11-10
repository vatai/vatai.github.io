---
layout: post
giscus_comments: true
title: "How to set up a website like this"
date: 2020-12-06 21:32:00 +0900
description: "Old post about setting up Minimal Mistakes Jekyll theme (which I'm not using anymore)"
categories: tutorial
---

## TL;DR:

Describe how to set up a website/statically generated microblog like
this one, which is essentially

- a [Jekyll website](https://jekyllrb.com/),
- using the [Minimal-mistakes
  theme](https://mmistakes.github.io/minimal-mistakes/),
- hosted on [GitHub pages](https://pages.github.com/).

## Introduction

Github pages (HTML only) with Jekyll is super simple to set up, but
the themes and the basic built-in stuff is relatively limited and
Minimal-mistakes is a good theme to add a bunch of extra stuff to your
website/microblog/whatever you want to call it.

### Jekyll

**Jekyll** is _like_ a build system, which "put's it all together" and
generates the static `.html` pages, so **Jekyll's documentation is
what you should most probably be reading**.

### Liquid

[Liquid](https://shopify.github.io/liquid/) is the template language,
which ties the data from the Jekyll to the webpages. Liquid is
applied independently to both `.md` and `.html` files. It is nicely
explained in the [docs](https://jekyllrb.com/docs/rendering-process/).

### Configuration file

Probably the most important thing about Jekyll is the `_config.yml`.
A lot of things can be controlled from there.

I am not sure if a `Gemfile` should be uploaded in your GitHub pages
repo. Since Jekyll is a Ruby app, it might be needed, but I am
definitely not sure about it. It might only be needed if you want to
use plugins.

### Previewing the website locally

You can "build" (i.e. generate) your site locally following the
instructions in the Jekyll [docs](https://jekyllrb.com/docs/).

I use these command line options when writing posts and fiddling with
the website (livereload is the good stuff).

```shell
jekyll serve --drafts --incremental --livereload
```

## Minimal-mistakes

To get the Minimal-mistakes theme running with your GitHub pages, just
copy the
[`_config.yml`](https://github.com/mmistakes/minimal-mistakes/blob/master/_config.yml)
(link to
[raw](https://raw.githubusercontent.com/mmistakes/minimal-mistakes/master/_config.yml)
file) from the Minimal-mistakes GitHub repo to your GitHub pages repo,
and make sure you uncomment `remote_theme :
"mmistakes/minimal-mistakes"`. This `_config.yml` file is in sync
with the Minimal-mistakes
[docs](https://mmistakes.github.io/minimal-mistakes/docs/configuration/)
and it is a good idea to go trough it quickly.

Alternatively, you could fork the Minimal-mistakes
[repo](https://github.com/mmistakes/minimal-mistakes) and add your
contents with `theme : "mmistakes/minimal-mistakes"` (instead of
`remote_theme`) in `_config.yml`.

### Front matter

I somehow missed this and it caused a lot of problems: Front matter is
a way to add metadata and/or commands to Jekyll how to render the
page. Front matter looks like this:

```md
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

Some things I've already set up in this page but did not describe here are:

- MathJax
- Style sheets
- Categories (partially solved)
