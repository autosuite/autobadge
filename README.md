# Autobadge

![Autobadge Stable Release][stable-release]
![Autobadge Development Release][development-release]
[![Maintainability][quality-image]][quality-link]
[![Test Coverage][coverage-image]][coverage-link]

[stable-release]: https://img.shields.io/static/v1?label=stable&message=v0.1.0&color=blue
[development-release]: https://img.shields.io/static/v1?label=in-dev&message=v0.2.0-rc2&color=red
[quality-image]: https://api.codeclimate.com/v1/badges/74ffb9e627a105dd7a43/maintainability
[quality-link]: https://codeclimate.com/github/autosuite/autobadge/maintainability
[coverage-image]: https://api.codeclimate.com/v1/badges/74ffb9e627a105dd7a43/test_coverage
[coverage-link]: https://codeclimate.com/github/autosuite/autobadge/test_coverage

## Introduction

This is a GitHub Action that automatically manages two version badges in your `README.md`:

- Current stable version.
- Current development version.

Here's an example of the badges in action:

![Autobadge Stable Release][example-stable-release]
![Autobadge Development Release][example-development-release]

[example-stable-release]: https://img.shields.io/static/v1?label=stable&message=v0.1.0&color=purple
[example-development-release]: https://img.shields.io/static/v1?label=develop&message=v0.2.0-rc2&color=purple

## Usage

> Though the example below uses `master`, you should use the explicit version suitable for your project.

Note that you will need to have an Action that performs a pre-commit (stage, commit) and push, as seen below:

```yaml
name: my-workflow

on: [push]

jobs:
  autocommit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: autosuite/autobadge@master
      - uses: autosuite/autocommit@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

Next, add the following lines to anywhere in your `README.md` file (see the source of this file as an example):

```md
[stable-release]: ...
[development-release]: ...
```

As well as these lines underneath the first header of the file:

```md
![Autobadge Stable Release][stable-release]
![Autobadge Development Release][development-release]
```

Obviously, you should make sure that your version tags exist and follow either `0.1.12` format or `v0.1.12` format.
Pre-release versioning is supported as well as well as build information, e.g.: `v0.1.12-rc3+commit-58`.

## Configuration

> You can see all configuration in the [action.yml](action.yml) file.

There is no special configuration for this Action. This may be subject to change as the need arises.

## Documentation

If you would like to contribute to this project, please read our [contributors documentation](CONTRIBUTING.md) and
our [code of conduct](CODE_OF_CONDUCT.md). The license we use for this project is defined in
[the license file](LICENSE).
