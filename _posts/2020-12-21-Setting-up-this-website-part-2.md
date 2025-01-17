---
layout: post
giscus_comments: true
title: "How to set up a website like this part 2"
date: 2020-12-21 22:00:00 +0900
description: "Old post about setting up Minimal Mistakes Jekyll theme (which I'm not using anymore)"
categories: tutorial
---

## TL;DR:

Some things I've already set up and promised to write about:

- MathJax
- Stylesheets
- Categories (now fully solved)

## MathJax

To set up MathJax for
[Jekyll](https://jekyllrb.com/)/[Minimal-mistakes
theme](https://mmistakes.github.io/minimal-mistakes/), you need two
things:

1. Include/link MathJax to your website like you'd do in when working
   with "regular `html`" (and optionally configure MathJax markup such
   as `$` or `\(`, `\)`)
2. Make sure that the markdown parser used by Jekyll knows about
   MathJax.

### Including MathJax

If we were working with simple `html`, the place to include this would
be inside the `<head>`. To include something in the head, we just
need to put it in `_includes/head/custom.html` - anything in this file
will be inserted into the heading of all `html` files generated by
Jekyll.

```html
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML"></script>

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    extensions: ["tex2jax.js"],
    jax: ["input/TeX", "output/HTML-CSS"],
    tex2jax: {
      inlineMath: [ ['$','$'], ["\\(","\\)"] ],
      displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
      processEscapes: true
    },
    "HTML-CSS": { availableFonts: ["TeX"] }
  });
</script>
```

In addition, we can make it a configurable option, if we want to load
MathJax on each of our pages using the Liquid template language, since
`_includes/head/custom.html` also passes trough it (more one this
below).

### kramdown

[kramdown](https://kramdown.gettalong.org/) is the default markdown
parser for Jekyll, and it is also explicitly set in the
Minimal-mistakes `_config.yml` like this:

```yaml
markdown: kramdown
```

Since we want to use MathJax in conjunction with markdown, kramdown
has to be made aware of it, which can be achieved like this in
`_config.yml`:

```yaml
kramdown:
  math_engine: mathjax
```

### Load MathJax for certain pages

To relieve the pressure on MathJax CDN servers, the MathJax loading
code can be wrapped inside a Liquid `if` statement like this:

```html
{% raw %} {% if page.usemathjax %}
<script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML"></script>

<script type="text/x-mathjax-config">
  ...
</script>
{% endif %} {% endraw %}
```

This way, the MathJax loading code is generating only when the
`usemathjax` variable is set for a page. You can set this variable in
the front matter of each page like this:

```md
---
---

## usemathjax: true
```

## Stylesheets

Stylesheets are configured similar to how MathJax was added to
`<head>`. In this case, the `/assets/css/main.scss` file needs to be
created, based on the same file in the Minimal-mistakes repo. Nice
explanation can be found in the Minimal-mistakes
[docs](https://mmistakes.github.io/minimal-mistakes/docs/stylesheets/).

## Categories

You can write a `.md` file which iterates trough the categories using
Liquid, or you can use a plugin like
`[jekyll-archives](https://github.com/jekyll/jekyll-archives)` to
generate these pages automatically. If you copied the `_config.yml`
from Minimal-mistakes, most of the settings should be there (it might
be commented, just search for `archive`).

Don't forget to create the following `category-archive.md` and
`tag-archive.md`.

`/_pages/category-archive.md` with contents:

```md
---
title: "Posts by Category"
layout: categories
permalink: /categories/
author_profile: true
---
```

`/_pages/tag-archive.md` with contents:

```md
---
title: "Posts by Tag"
permalink: /tags/
layout: tags
author_profile: true
---
```

This should create the `/categories` and `/tags` pages on your website.

## Masthead i.e. links on the top

The links (and the large icon) on top of the page, including the title
(with the link that takes you to the root/home) is called the
masthead. It can be filled by adding entries to
`/_data/navigation.yml` such as this:

```yml
main:
  - title: "About me"
    url: /aboutme
```

More details in the Minimal-mistakes
[docs](https://mmistakes.github.io/minimal-mistakes/docs/navigation/).
