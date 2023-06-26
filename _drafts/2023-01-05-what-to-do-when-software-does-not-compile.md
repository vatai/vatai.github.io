---
title: "What to do when software doesn't compile"
date: 2023-01-05 14:29:00 +0900
categories: programming
---

**tl;dr of post**: I figured out how to compile
[pluto](http://pluto-compiler.sourceforge.net/). After a lot of
frustrations I'm happy now. See [Keys to success](#keys-to-success)
below.

New year is here, and we're all full motivation including me, and that
means I just can't help myself but to write a blog post. Yaay! Right?

Well, not really. It way simpler than that: I finally managed to
compile Pluto and real work can actually begin... but this is the nice
way to kill time while I'm verifying if my compilation script really
works.

# Other people's software

**tl;dr of section**: Can skip. Soft intro. Pathetic attempts at
humour (including gifs).

While "normal people" use software (and by software I mean libraries)
as is, and rarely compile software other than the one they are working
on and developing themselves, armed with *well established* build
scripts for each platform, using well supported libraries, in
[HPC](https://en.wikipedia.org/wiki/High-performance_computing) it is
not uncommon to find yourself compiling all kinds of software
(e.g. benchmarks, scientific applications) with all kinds of
compilers, on all kinds of systems (where you don't have root
privileges) with access to custom "replacement" libraries and
compilers.

In such situations, compilation rarely succeeds on the first try! This
can happen for various reasons: unsupported compiler or compiler
version, missing library or incompatible library replacement/version.
Not to mention the quality of the software (or install scripts) is
sometimes just awful. Since scientific codes are usually written for
single paper/project and not necessarily maintained in the long-run,
dependence on ancient libraries is common. If you find scripts
contains hardcoded path names to `/home/phdstudent/thesis/compile.sh`
you know you struck gold.

<iframe src="https://giphy.com/embed/Fjr6v88OPk7U4" width="387" height="480" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/eye-roll-bitch-please-Fjr6v88OPk7U4">via GIPHY</a></p>

Oh, and *I use arch, btw* (which probably has the problem of being a
bit *too new* and/or *too cool*). This post is about me trying to
compile [pluto](http://pluto-compiler.sourceforge.net/) on my home
system, which makes it extremely embarrassing (since there I do have
root privileges), but I feel obliged to write this since I want to
document what I did right (and what I did wrong) to avoid wasting this
much time and energy the next time I find myself in a similar
situation.


# The current case: PLuTo

**tl;dr of section**: Overview of Pluto and its dependencies.

[Pluto](http://pluto-compiler.sourceforge.net/) is a source-to-source
compiler, doing polyhedral compilation (aka [polytope
model](https://en.wikipedia.org/wiki/Polytope_model) -- you probably
haven't even heard about it) and implementing one of fundamental
tiling algorithms known by the name of this project only as "the pluto
algorithm".

Pluto is not at all bad software, but it does have a bunch of custom
dependencies, and is not used by a huge audience (have I mentioned it
is about polyhedral model? It's cool right?).  One such dependency
which caused the problems is the *Polyhedral Extraction Tool*:
[PET](http://repo.or.cz/w/pet.git). Again, PET is not bad software,
but it does depend on (LLVM)[https://github.com/llvm/llvm-project],
and while LLVM has a huge user base, is actively developed and
probably had more then 10 versions increments since PET started using
it (and 3-4 increments since PET's readme file was updated). Ergo, it
is no surprise that (as far as I can tell) PET does not work with the
newer versions of llvm (14.0.6 which is installed on my system).


# Bad failures, aka what not to do

**tl;dr: of section**: Can skip. Describe how it started and the initial, panic
induced, inefficient approaches to the problem.

I needed Pluto in the first place to do experiments with the
polyhedral model and to better understand the Pluto algorithm.  After
the fiveish lines of instructions on how to compile and install it
failed, needles to say I (slightly) panicked, since this compilation
was supposed to be *the first* and **trivial step** in an already
daunting task.

Following the install instructions from the GitHub page, I was greeted
with undefined functions/classes.  As I recall (I might update this
after verification), the constructor of the `Driver` class (in LLVM)
was different, which is bad since it doesn't mean that e.g. LLVM is
not installed and it can't import `<clang/Driver/Driver.h>`, but it
means that the definition inside the `Driver.h` file is different from
what PET expects -- probably because of major version change (if
you're not sure why I can state with confidence that is was a *major
version* change and not a *mionr* or *patch* version change, you
should read up on [semantic versioning](https://semver.org/)).  So I
did the logical thing:

<iframe src="https://giphy.com/embed/1EghTrigJJhq8" width="480" height="360" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/text-street-popkey-1EghTrigJJhq8">via GIPHY</a></p>

This was followed with a blind experimentation with compilation flags,
dreading the need to compile LLVM from scratch.  This fear was mostly
propelled by the fact that LLVM is not just one library, it has at
least half a dozen "subprojects" and I had no ide which ones I need.
This situation was further aggravated by some incompatible between my
modern/current GCC (12.2.0) which drove me to quit trying for a while.

# Keys to success

**tl;dr: subsections**: A good setup/plan of how you'll debug the
compilation errors, the necessary tools to implement this plan and
strong google foo is essential.

## Look for help

The first ray of light came of course from the interwebz when I found
[compilation/installation
instructions](https://kumasento.github.io/2020-07-04-setting-up-development-environment-of-the-barvinok-library/)
for [Barvinok](https://barvinok.sourceforge.io/) (which I haven't
tested yet but will in the future).  Finding these instructions wasn't
trivial (even tho I was looking for Barvinok install instructions) and
I don't remember what was my search query -- so lets write it up as
strong google foo (aka *pure luck*).

Another significant step forward came after realising a major omission
on my part: both Pluto and PET docs say that the requirement is *LLVM
2.9 or higher until 11.0* and that arch does have an `llvm11` package.
Now installing this `llvm11` package as didn't help much (and I also
wanted to keep the new LLVM as my system LLVM), but it did help me
figure out how to compile LLVM on my system. The
[package](https://archlinux.org/packages/extra/x86_64/llvm11/) links
to the
[PKGBUILD](https://github.com/archlinux/svntogit-packages/blob/packages/llvm11/trunk/PKGBUILD)
file which contains build instructions and the patches required to
build LLVM11, or as it turns out LLVM10 (which is in my scripts at the
time of writing).

So with LLVM v10 compiling (also v9, these two are the ones tested), I
was overwhelmed with joy that I can use the `--with-llvm-prefix=`
option in the `./configure` script of Pluto. Or at least so I thought,
now, after overcoming the undefined error messages, I was greeted with
new "undefined reference" linker errors!

Yeey! This is progress.  So now I had the right LLVM, all seemed to be
right with the world but for some reason the linker was not seeing the
right libraries.  Again I panicked, and after a few days of
frustrations, because both LLVM and Pluto have a bunch of options
(`cmake` variables for LLVM, `./configure` variables for Pluto), I
again went to the gut instinct of trying out a gazillion different
settings without knowing what I'm doing -- because you know, "This
should be working!!!".

## A good setup

Things are not working and you've tried the obvious, which means
tracking changes will be crucial.

### Script it!
Going back to bash history for commands with long list of
options/flags or a long sequence of commands is error prone. Scrip
everything. No need for smart scripts, which handle different
parameters -- make sure in the end your build boils down to the
execution of one or two script (without any complicated parameters).

### Track changes!
That is, use `git` (and notes).  One approach which felt right in the
end, was as follows:

- If you don't know what to do, starting from a commit try different
  stuff (different parameters/settings), but after each change revert
  back to the clean commit.
- When you realise you're doing a bunch of changes or you have an idea
  or a plan of a more complicated approach which needs multiple
  changes, remember to [commit
  oftern](https://sethrobertson.github.io/GitBestPractices/).

Don't forget always to [write good commit
messages](https://cbea.ms/git-commit/#seven-rules): when trying out
different stuff and making progress, make sure to mention the change
in the commit message. Keep commits which clean up the code well
marked and separate from attempts at modifying some flags/options.

### Take notes!
When you're trying out different changes and going
back to the same commit, take notes what was already tried out, and
what error message it emitted.

### Clean builds vs considering time!
Compilation bigger software can take a non-negligible amount of time
and one has to consider when to use "clean" and when to use
"incremental" builds.

- A clean build (i.e. delete all previous files) takes a lot of time
  but ensures nothing left from the previous build influences the new
  builds.
- An incremental build usually is much faster but leftovers of
  previous builds may mess up the current build.

For small and fast builds should always be clean builds, but for a
large code base incremental builds are preferred, with the occasional
clean build as verification that everything functions properly.

### LLVM specific remarks

- Build LLVM release with `-DCMAKE_BUILD_TYPE=Release`, since it is
  much smaller and faster then debug.
- If the build is failing then limit the number of link jobs using
  `-DLLVM_PARALLEL_LINK_JOBS=4`.

### Don't do too many things at once!
For example:

- You'll forget to commit.
- Editing a bash script while bash is reading it can cause strange
  errors.
- It is even more problematic on big HPC systems with schedulers, when
  config files are read when the job gets scheduled.


## Know your tools

As described in the excellent book [The Pragmatic
Programmer](https://pragprog.com/titles/tpp20/) you should really know
your tools.  Probably the most important tool under your belt is
you're shell and/or bash.  I write "and/or" because while I use `zsh`
as my main shell, I still write shell scripts in (ba)sh.  It is very
important to have a clear picture how different (instances) of shells
interact, what is the difference between calling a script with
`source` (same as if the script was typed into the current prompt,
e.g. defined variables remain) or invoking it with bash or executing
the script if it is set to be executable (in both of these cases a new
`bash` child process is spawned and only `export`ed variables are
visible to the child, also variables defined in the subprocess all
disappear after the shell terminates).

Something else I found more than once useful the `set_env` function
below.  When you build a program with a custom `PREFIX` (for example
under the home folder because the lack of `sudo` privilages), you can
use `set_env` to expand the shell's `PATH`, `LD_LIBRARY_PATH`,
`C_INCLUDE_PATH` and `CPLUS_INCLUDE_PATH` with the corresponding
subfolders of the `PREFIX` path.

```bash
function set_env ()
{
  echo $1
  if [ -d "$1/bin" ]; then
    export PATH="$1/bin${PATH:+:${PATH}}"
  fi
  if [ -d "$1/bin64" ]; then
    export PATH="$1/bin64${PATH:+:${PATH}}"
  fi
  if [ -d "$1/lib" ]; then
    export LD_LIBRARY_PATH="$1/lib${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}"
    export LIBRARY_PATH="$1/lib${LIBRARY_PATH:+:${LIBRARY_PATH}}"
  fi
  if [ -d "$1/lib64" ]; then
    export LD_LIBRARY_PATH="$1/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}"
    export LIBRARY_PATH="$1/lib64${LIBRARY_PATH:+:${LIBRARY_PATH}}"
  fi
  if [ -d "$1/include" ]; then
    export C_INCLUDE_PATH="$1/include${C_INCLUDE_PATH:+:${C_INCLUDE_PATH}}"
    export CPLUS_INCLUDE_PATH="$1/include${CPLUS_INCLUDE_PATH:+:${CPLUS_INCLUDE_PATH}}"
  fi
  if [ -d "$1/man" ]; then
    export MAN_PATH="$1/man${MAN_PATH:+:${MAN_PATH}}"
  fi
}
```

Other things I tend to use often in shell scripts are the `&&` (for the usual don't that if this fails) and `||` (preceded by a test, e.g. create a directory if it is not there) operators to chain commands together, and the `pushd`, `popd` pair to change directories.  Also `set -e` and/or `set -x` (see [Good failures, and finally success](#good-failures-and-finally-success) below).

Some other *tools* I've found useful:

- `git` obviously, but you need to know how to use it without major restrictions!
- [`ag`](https://github.com/ggreer/the_silver_searcher) is *The Silver Searcher*.  A **very fast** `grep` like utility for code.
- You should have a good *terminal*.  I've just recently gave up on the default Gnome terminal, and switched to [Kitty](https://sw.kovidgoyal.net/kitty/).
- When we're talking compiling, [`nm`](https://linux.die.net/man/1/nm) is command I didn't know about.
- And obviously you absolutely must have a great editor, and obviously it should be [Emacs](https://www.gnu.org/software/emacs/) because that is what [real programmers](https://xkcd.com/378/) use! (As a personal note, this is when I discovered [org-mode](https://orgmode.org/) [column-view](https://orgmode.org/manual/Column-View.html)).

# Good failures, and finally success

**tl;dr of the section**: The steps I did when I felt like I know what I'm doing.

## Read the error message

Sometimes, the most obvious things are the most important things! Read and understand the error message.  Possible figure out what causes it.  If you've figured it out, half of the problem is already solved!

## Figure out what generated the error message

For *bash* use `bash -x` or `set -x`.  The later has the advantage that it can strategically be placed at a in the middle of the script, closer to the error message, saving you from going manually through pages of `bash` output.

For *Makefiles* `make <options> SHELL='sh -x'` should make hidden command echos visible. For AutoTools and CMake, sometimes `make <options> V=1` or `make <options> VERBOSE=1` may work ([SX answer](https://stackoverflow.com/a/32010960/568735)).

## Reproduce the error message

## Fix the error message

## Finalise the fix


# Results

So without further ado, the scripts which I used to build Pluto on my
Arch system.


```sh
$ cat llvm.src
set -x
set -e

mkdir_ok_if_exists ()
{
    [ -e "$1" ] || mkdir -p "$1"
}

ROOT=$(pwd)
DOWNLOAD="${ROOT}/downloads"
OPT="${ROOT}/opt"
BUILD="${ROOT}/build"
mkdir_ok_if_exists "$DOWNLOAD"
mkdir_ok_if_exists "${OPT}"
mkdir_ok_if_exists "${BUILD}"

LLVM_BRANCH="10.0.0"
LLVM_FILE="llvm-project-${LLVM_BRANCH}"
LLVM_PREFIX="${OPT}/${LLVM_FILE}"
```

```sh
$ cat llvm.sh
#! /usr/bin/bash

source ./llvm.src

LLVM_EXT="tar.xz"
LLVM_URL_DIR="https://github.com/llvm/llvm-project/releases/download/llvmorg-${LLVM_BRANCH}"
LLVM_URL="${LLVM_URL_DIR}/${LLVM_FILE}.${LLVM_EXT}"
LLVM_EXTRACTED="llvm-project-${LLVM_BRANCH}"
LLVM_CMAKE_ARGS=(
    -G Ninja
    -DCMAKE_BUILD_TYPE=Release
    -DCMAKE_INSTALL_PREFIX=${LLVM_PREFIX}
    -DLLVM_PARALLEL_LINK_JOBS=4
    -DLLVM_ENABLE_PROJECTS="clang"
)

wget -nc "${LLVM_URL}" -O "${DOWNLOAD}/${LLVM_FILE}.${LLVM_EXT}" || true

wget -nc "https://raw.githubusercontent.com/archlinux/svntogit-packages/packages/llvm11/trunk/utils-benchmark-fix-missing-include.patch" -O "${DOWNLOAD}/utils-benchmark-fix-missing-include.patch" || true

pushd "${BUILD}"
[ -e "${LLVM_EXTRACTED}" ] || tar xvf "${DOWNLOAD}/${LLVM_FILE}.${LLVM_EXT}"
pushd "${LLVM_EXTRACTED}"

mkdir_ok_if_exists build
patch -Np1 -i "${DOWNLOAD}/utils-benchmark-fix-missing-include.patch" || true
cmake -S llvm -B build "${LLVM_CMAKE_ARGS[@]}"
cmake --build build

rm -rf "${LLVM_PREFIX}"
ninja -C build install

popd
popd
```

```sh
$ cat pluto.sh
#! /usr/bin/bash

source set_env.src
source llvm.src

set_env "${LLVM_PREFIX}"

PLUTO_EXT="tar.gz"
PLUTO_VERSION="0.11.4"
PLUTO_PREFIX="${OPT}/pluto-${PLUTO_VERSION}"

PLUTO_CONFIGURE_ARGS=(
    --prefix=${PLUTO_PREFIX}
    --with-clang-prefix=${LLVM_PREFIX}
)

pushd ${BUILD}
[ -e pluto ] || git clone --recurse-submodule git@github.com:bondhugula/pluto.git
pushd pluto

./autogen.sh
./configure "${PLUTO_CONFIGURE_ARGS[@]}"
make -j LDFLAGS="-lclangFrontend -lclangBasic -lclangLex -lclangDriver"
make -j test

rm -rf "${PLUTO_PREFIX}"
make install

popd
popd

```
