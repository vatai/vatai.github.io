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
compile pluto and real work can actually begin... but this is the nice
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

script everything

track changes with good commit messages

take notes

commit clean up changes

considering time -- incrementally
- llvm release

don't do too many thins at once (forget to commit, edit script while
bash is reading it, even more problematic on big hpc systems with
schedulers)


## Know your tools

shell (hej programozas konyv)

- chain commands with: `||` and `&&`

- set_env

ag, kitty, git, nm, emacs (discovered column view), 

# Good failures, and finally success

read the error message

figure out what generated the error message

reproduce the error message

fix the error message

finalise the fix


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
