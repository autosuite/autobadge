# Autobadger

![Autobadger Release Stability](https://img.shields.io/static/v1?label=stability&message=unusable&style=flat-square&color=red)
![Autobadger Latest Release](https://img.shields.io/static/v1?label=latest&message=0.0.0&style=flat-square&color=purple)

[_What are these badges?_](https://github.com/teaminkling/tree/master/BADGES.md)

## Introduction

GitHub Action that automatically manages a few types of badges in a predetermined area in your README.md file:

- Current version.
- Stability (post-1.0.0 release, pre-1.0.0 release, pre-0.1.0 release).
- A link to a Markdown file in this repository.

## Usage

This is best added to a workflow on `push` to any branch. For now, since it only detects the `README.md` file, there is no need to provide any additional information. This may change in the future.

Note that you will need to have an action that performs a pre-commit (stage, commit) and push:

```yaml
name: my-workflow

on: [push]

jobs:
  autocommit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: teaminkling/autobadger@master
      - name: Pre-remote commit actions
        run: |
          git add CHANGELOG.md && \
            git config --local user.email "action@github.com" && \
            git config --local user.name "GitHub Action" && \
            git commit -m "[skip-ci, auto] Make changes automatically to meta files." || \
            echo "Nothing to commit."
      - uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

Next, add the following lines to anywhere in your `README.md` file:

```md
![Autobadger Release Stability](#)
![Autobadger Latest Release](#)

[What is this?](https://github.com/teaminkling/tree/master/BADGES.md)
```

## Documentation

If you would like to contribute to this project, please read our [contributors documentation](CONTRIBUTING.md) and our [code of conduct](CODE_OF_CONDUCT.md).

The license we use for this project is defined in [the license file](LICENSE).

Thanks!
