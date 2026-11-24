---
title: Writing tables
description: Column alignment, and how a wide table scrolls inside its own box instead of widening the page.
pubDatetime: 2026-11-18T10:00:00+01:00
tags: [writing]
---

Tables use the usual Markdown pipe syntax. Colons in the separator row set the alignment of each column.

## Small table

| Command       | What it does                  |
| :------------ | :---------------------------- |
| `pnpm dev`    | Runs the dev server.          |
| `pnpm build`  | Builds the site into `dist/`. |
| `pnpm verify` | Checks the built site.        |

## Alignment

| Left aligned | Centered | Right aligned |
| :----------- | :------: | ------------: |
| one          |   two    |             1 |
| three        |   four   |            22 |
| five         |   six    |           333 |

## Wide table

A table wider than the text column scrolls sideways inside its box. The page itself never gets wider.

| Left aligned | Centered | Right aligned | First long column                                             | Second long column                                                   | Third long column                                                       | Fourth long column                                                | Notes |
| :----------- | :------: | ------------: | ------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- | ----- |
| alpha        |   beta   |             1 | A fairly long cell of text that forces this column to be wide | Another long cell of text that keeps the row from fitting on a phone | A third long cell of text that keeps widening the table past the column | A fourth long cell of text so that horizontal scrolling is needed | none  |
| gamma        |  delta   |            22 | Short                                                         | Short                                                                | Short                                                                   | Short                                                             | none  |
| epsilon      |   zeta   |           333 | More long text for the first column in this last row          | More long text for the second column in this last row                | More long text for the third column in this last row                    | More long text for the fourth column in this last row             | none  |
