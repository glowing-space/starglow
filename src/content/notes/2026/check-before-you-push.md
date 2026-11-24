---
title: Check the site before you push
description: The two commands that catch most problems before CI does.
tags: [notes, ci]
---

Run the same checks as CI locally, so a pull request does not fail on something small.

## With Docker

`./dev.sh ci` runs the formatter check, the linter, `astro check`, the build, the offline link check, `pnpm verify` and the placeholder check, in that order.

## Without Docker

```sh
pnpm run format:check && pnpm run lint && pnpm build && pnpm verify
echo "the offline link check needs lychee, which ./dev.sh links runs in a container, so skip it here or install lychee on the host"
```
