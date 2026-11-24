---
title: Customising Starglow
description: The three slot files that are yours, the colour and type tokens, the fonts, and what the build checks for you.
pubDatetime: 2026-11-12T10:00:00+01:00
tags: [docs, design]
---

Most changes need no theme code at all: the config file covers the switches, and three slot files cover your own markup. This post covers what to edit when you want more.

## Slot files

`src/custom/` holds three components that the theme renders but never changes after a release. Put your own markup there, and theme updates will not conflict with it.

| File                       | Rendered                                          | Typical use                                |
| :------------------------- | :------------------------------------------------ | :----------------------------------------- |
| `src/custom/Head.astro`    | In `<head>` on every page, after the theme's tags | Analytics, verification tags, stylesheets  |
| `src/custom/BodyEnd.astro` | Right before `</body>` on every page              | Scripts and widgets                        |
| `src/custom/PostEnd.astro` | On post pages, before the previous and next links | Comments, a newsletter form, an author bio |

`Head.astro` receives the page `title` and `description`, and `PostEnd.astro` receives the `post` entry, so you can skip some posts:

```astro
---
import type { CollectionEntry } from "astro:content";
type Props = { post: CollectionEntry<"posts"> };
const { post } = Astro.props;
---

{!post.data.tags.includes("no-comments") && <section>Comments go here</section>}
```

## Colours

The palette is Catppuccin: Latte for the light theme and Mocha for the dark one, with pink as the accent. Every colour is a CSS variable in `src/styles/site-theme.css`, in one block per theme:

```css
[data-theme="dark"] {
  --background: #1e1e2e;
  --foreground: #cdd6f4;
  --accent: #f5c2e7;
  --border: #45475a;
}
```

Social images are drawn by satori, which cannot read CSS variables, so their colours are mirrored in `src/utils/ogTheme.ts`. If you change the palette, change both files. The `og-palette` check in `pnpm verify` fails when they drift apart.

Keep text contrast at WCAG AA or better when you pick new colours.

## Type and spacing

The theme uses a short type scale and two weights, 400 and 600. The sizes are defined once in `site-theme.css`, and `pnpm verify` rejects any other size or weight in the built CSS. That check is deliberate: it keeps a customised site from slowly collecting one-off sizes. Add a size to the scale and to the check together if you need one.

## Fonts

Three self-hosted fonts are loaded through the Astro fonts API in `astro.config.ts`:

- **Inter** for reading text.
- **JetBrains Mono** for code and data such as dates and paths.
- **Pixelify Sans** for the header wordmark only.

The font files and their SIL Open Font License texts are in `src/assets/fonts/`. To swap a font, replace the files and the matching entry in the `fonts` list. The CSS reads them through `--font-inter`, `--font-jetbrains-mono` and `--font-wordmark`.

## Checking your changes

Run the full check set before you publish:

```bash
./dev.sh ci
```

It runs the formatter check, the linter, `astro check`, the build, an offline link check, `pnpm verify` on the built site and the placeholder check. `pnpm verify` covers things like canonical links, heading order, the search index, structured data and the type scale.
