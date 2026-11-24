---
title: Writing callouts
description: The five GitHub alert types, custom titles and several paragraphs inside one callout.
pubDatetime: 2026-11-17T10:00:00+01:00
tags: [writing]
---

Callouts use the GitHub alert syntax, so the same Markdown renders on GitHub too:

```md
> [!TIP]
> Optional information to help a reader be more successful.
```

## Alert types

> [!NOTE]
> Highlights information that readers should take into account, even when skimming.

> [!TIP]
> Optional information to help a reader be more successful.

> [!IMPORTANT]
> Crucial information necessary for readers to succeed.

> [!WARNING]
> Critical content demanding immediate reader attention because of potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

## Custom title

A title can follow the alert type on the same line:

> [!TIP] Faster builds
> Run `pnpm build:site` to skip `astro check` while you iterate on styles.

## Several paragraphs and inline code

> [!NOTE] Two paragraphs
> The first paragraph mentions `inline code`, so its colours and size can be checked in both themes.
>
> The second paragraph checks the spacing between paragraphs inside a callout.

### Headings get anchors

Every heading from `##` down gets a link anchor at build time. Hover a heading to see it.
