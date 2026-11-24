# Contributing to starglow

Thanks for helping. starglow is a small theme with a strong opinion about
staying minimal, so please open an issue before a large change or a new
feature: it saves both of us time.

## Ground rules

- One purpose per pull request.
- Minimal client JavaScript. A feature that needs a framework or a large
  dependency is unlikely to be accepted; make it optional if it is.
- Accessibility (WCAG AA) and `prefers-reduced-motion` are not optional.
- Hover and focus states must never shift layout.
- No external service may be required for a build.

## Setup

```sh
pnpm install
pnpm dev          # http://localhost:4321
```

Or, with only Docker on the host, `./dev.sh`. See
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for every command.

## Before you open a pull request

Run the same checks as CI:

```sh
./dev.sh ci       # format, lint, astro check, build, links, dist assertions
```

Natively: `pnpm format:check && pnpm lint && pnpm build && pnpm verify`.

Add a line under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for any
user-visible change. If it breaks an existing site, add upgrade steps to
[UPGRADING.md](UPGRADING.md).

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/):
`feat(footer): …`, `fix(search): …`, `docs: …`. Keep the subject under 72
characters and explain the why in the body.

## Licence

By contributing you agree that your contribution is licensed under the
project's [MIT License](LICENSE).
