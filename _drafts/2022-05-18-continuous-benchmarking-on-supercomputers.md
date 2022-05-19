---
title: "Continuous benchmarking on supercomputers"
date: 2022-05-18 20:12:00 +0900
categories: programming
---


A paper [Towards Continuous Benchmarking: An Automated Performance
Evaluation Framework for High Performance
Software](https://doi.org/10.1145/3324989.3325719) by Anzt, H. et
al. describes the posibilities of *continuous benchmarking* (CB),
however it doesn't give direct instructions how to implement it.
Looking at the source code is always a possibility, but the `yaml`
files there aren't really documented (which is no surprises since they
are pretty self evident).  Still, I hope this post will help people
who unfamiliar with *Continuous X* approaches (where X can be
integration, development, benchmarking etc).

# Overview

We will need 3 things:

- The **app/benchmark** itself, which we will assume to be given.
- We need to set up a **"self-hosted runner"**, the program running on
  the supercomputer, which will be executing the actions such as
  compiling the app and submitting job to the scheduler of the
  supercomputer.
- The **yaml file** which describes when and what should be executed
  by the "runner".

I'll be describing the scenario for GitHub.  Other sites like GitLab
have similar systems.


## Self-hosted runner

In the Github repo **settings**, on the left-hand side, under
**Actions** there is a **Runners** page.  In the top-right corner
there is a green **New self-hosted runner** button.  Clicking on this
button brings up a page where you can select the OS and architecture.
For supercomputers Linux, x64 is a good choice since usually that is
something that will run on the login node.

Below the OS and architecture choice, the page lists the commands
needed to install the self-hosted runner.  This consists of several sections.

The first section described how to download, validate and extract the
runner software. **Don't use these instructions**, use the ones from
the GitHub settings page.

    # Create a folder
    $ mkdir actions-runner && cd actions-runner
    # Download the latest runner package
    $ curl -o actions-runner-linux-x64-2.291.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.291.1/actions-runner-linux-x64-2.291.1.tar.gz
    # Optional: Validate the hash
    $ echo "1bde3f2baf514adda5f8cf2ce531edd2f6be52ed84b9b6733bf43006d36dcd4c  actions-runner-linux-x64-2.291.1.tar.gz" | shasum -a 256 -c
    # Extract the installer
    $ tar xzf ./actions-runner-linux-x64-2.291.1.tar.gz

How to configure and run the self-hosted runner.  Again **don't use
these instructions**, use the ones provided on the settings page,
since the `--url` and the `--token` are dependent on the repo you want
to add the runner to.

    # Create the runner and start the configuration experience
    $ ./config.sh --url https://github.com/<user>/<repo> --token <token>
    # Last step, run it!
    $ ./run.sh

The third section describes how to enable the runner in the Yaml file
which is described in the next section.

    # Use this YAML in your workflow file for each job
    runs-on: self-hosted

This is the procedure to add a self-hosted runner to a repo.  To the
best of my knowledge, self-hosted runners can be added to GitHub users
or GitHub organisations.


## Yaml file

`<repo>/.github/workflows/build.yml`

    name: Build and submit
    on: push
    jobs:
      build:
        name: Build
        runs-on: [self-hosted,login-node]
        steps:
        - uses: actions/checkout@master
        - name: Create build dir
          run: mkdir build
        - name: Run cmake
          working-directory: ./build
          run: CXX=FCCpx cmake ..
        - name: Build
          run: cmake --build build --clean-first
        - name: Submit
          run: pjsub -g $(stat . -c %G) sub.sh
