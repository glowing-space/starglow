# Changelog

All notable changes to Starglow are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/). Breaking changes always come with
upgrade steps in [UPGRADING.md](UPGRADING.md).

## [Unreleased]

### Added

- First public version, derived from AstroPaper v7.2.1.
- Banded page header with optional ambient light (`appearance.ambient`:
  `none`, `light`, `breathe`, `dawn`) and a pixel wordmark with optional glow.
- Posts, notes, projects and a lab, with tags, related content, RSS, sitemap,
  Pagefind search and generated Open Graph images.
- Labelled code, table and callout blocks; GitHub alert callouts.
- Vim-style statusline on post and note pages (`appearance.statusline`).
- 88x31 footer badges for links and socials (`links`).
- View-source banner (`site.sourceBanner`) and a terminal-style 404 page.
- Colour palettes, dark and light chosen separately (`appearance.palette`):
  dark glowing, void, aurora, ember; light glowing, paper, petal, frost,
  sand. Custom palettes via `appearance.palettes`; WCAG AA checked by
  `pnpm verify`. Code highlighting follows the palette.
- Live preview panel for demos (`appearance.preview`).
- Footer credit "powered by starglow" (`footer.credit`, on by default).
- Build checks: `verify-dist` assertions over `dist/`, placeholder marker
  check, offline link check, SHA-pinned GitHub Actions audited by zizmor.
