---
title: "The curse and the blessing of OSS"
date: 2021-11-18 12:41:00 +0900
categories: programming emacs debugging
---

# Open source software is buggy, but you can fix it!

Open source software (OSS), like
[Emacs](https://www.gnu.org/software/emacs/) (my favorite editor) or
its packages/add-ons, can sometimes be buggy.  Usually, because it is
developed and/or maintained by developers in their free time.  Hence,
if something is broken, you can volunteer to fix it, in **your** free
time. `^_^`.  Like I did
[here](https://github.com/company-mode/company-mode/pull/1261/files),
see?

# Emacs and company mode

I use [`company-mode`](https://github.com/company-mode/company-mode),
an add-on which displays the auto-completion results in Emacs.  I had
some strange setup copied from God knows where, which kinda worked
with some quirks, but I decided to clean it up.  After clean up, in
**some** situations it failed with some cryptic error message.
Eventually I found the error, and fixed it.  A single `.` character,
**one dot** was missing
[here](https://github.com/company-mode/company-mode/pull/1261/files).

# Finding the error

Emacs is good OSS.  They say it's [the most successful malleable
system in
history](https://malleable.systems/blog/2020/04/01/the-most-successful-malleable-system-in-history/),
i.e. it is really fun and easy to thinker with it.  You can call the
`toggle-debug-on-error` built-in function, which, in this situation
didn't crash Emacs the editor, just failed with an error message (for
the cases when it makes Emacs crash, you have the
`toggle-debug-on-quit` function).

With `toggle-debug-on-error` on, one just has to trigger the error and
a very nice backtrace pops up. This backtrace contains all the
functions in the call chain with the values of arguments.  These
function names are clickable links which take you to the definition of
the function, enabling the person debugging to easily track down what
is actually happening in the code.  Most of Emacs lisp is very nicely
written and easy to follow.

# Understanding the error

The error said that the `expand-file-name` function got a list of
strings, i.e. `("symbol-parameter.svg")` as an argument instead of
just a string (i.e. `"symbol-parameter.svg"`).  It wasn't hard to
find, that `"symbol-parameter.svg"` was coming from an association
list (an `alist), i.e. a list which contains key value pairs.

In Emacs, everything is simple.  There no list, only `cons` i.e. pairs
which in parenthesis with the two elements separated by a dot i.e. `(x
. y)`. Lists are just chained together `cons`, terminated by the
special "empty-list" `()` or `nil` element.  In other words, a list
like this: `(a b c)` is just syntactic sugar for three `cons` arranged
as follows: `(a . (b . (c . nil)))`.  This way the head of the list is
always the first element (`car` in Emacs lisp) of the `cons` and the
tail is the second element (`cdr` in Emacs lisp).

Because of this, when the program was getting the `cdr` (tail, or the
second element) of the line containing the error, which said
`(type-parameter "symbol-parameter.svg")`, what it got was
`("symbol-parameter.svg" . nil)`, a `cons`, which is the same as the
`("symbol-parameter.svg")` list.  With the fix, the line with the
error, which was same as 2 `cons`: `(type-parameter
. ("symbol-parameter.svg" . nil))`, now becomes what it should be a
single `cons`: `(type-parameter . "symbol-parameter.svg")`.

The reason for the whole confusion was that Emacs really just uses the
list syntax as syntactic sugar (without checking) for a `cons` and it
is easy to mix up the two.
