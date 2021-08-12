#!/usr/bin/bash

export GEM_HOME="$(ruby-2.7 -e 'puts Gem.user_dir')"
export PATH="$GEM_HOME/bin:$PATH"

bundle-2.7
bundle-2.7 exec jekyll serve --drafts --incremental --livereload
