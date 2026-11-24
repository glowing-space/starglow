# starglow: development and reference

The full reference for working on a starglow site: commands, checks, authoring rules and configuration. The [README](../README.md) has the short version, and the example posts on the demo site walk through the same topics.

## Development

### Docker

`./dev.sh` runs the container as your host user and keeps `node_modules/` in the repository directory, so no files end up owned by root.

| Command                          | What it does                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `./dev.sh`                       | Same as `./dev.sh dev`: dev server on port 4321, drafts are visible                             |
| `./dev.sh build`                 | Installs from the lockfile, runs `astro check`, builds `dist/` and ends with the marker check   |
| `./dev.sh check`                 | Installs from the lockfile and runs `astro check` only                                          |
| `./dev.sh preview`               | Serves the existing `dist/` on port 4321 (run `./dev.sh build` first)                           |
| `./dev.sh ci`                    | The pull-request check set: format, lint, `astro check`, build, offline link check, dist checks |
| `./dev.sh links`                 | Offline link and anchor check over an existing `dist/` (lychee)                                 |
| `./dev.sh workflows`             | Audits `.github/` with actionlint and zizmor                                                    |
| `./dev.sh new <type> <slug>`     | Scaffolds a draft post, note or project, see [Authoring](#authoring)                            |
| `./dev.sh pnpm verify`           | Runs the assertions over an existing `dist/` (`pnpm verify`)                                    |
| `./dev.sh pnpm markers`          | Lists unfilled `[[TODO: …]]` markers (`pnpm markers`)                                           |
| `./dev.sh pnpm markers --strict` | The same list, failing while any marker remains (what the deploy runs; needs a built `dist/`)   |
| `./dev.sh shell`                 | Opens a bash shell in the dev container                                                         |
| `./dev.sh pnpm <...>`            | Runs any pnpm command in the container, for example `./dev.sh pnpm add <package>`               |

`./dev.sh new` is the only command that runs on the host without Docker. It needs GNU `date` (GNU coreutils: standard on Linux, `brew install coreutils` and its `gnubin` first in `PATH` on macOS) and the system time zone database (`tzdata`).

#### Testing on a phone over the LAN

The dev server listens on all interfaces. Open `http://<your-computer-ip>:4321/` on the phone, using the IP address of the computer (for example from `ip addr`). Host names other than `localhost` are rejected by the Vite host check, so use the IP address.

Do not run the dev server on an untrusted network, such as public Wi-Fi: it binds to `0.0.0.0` and everyone on the network can reach it, drafts included.

### Native

Install an official Node.js 22 build of version 22.23.4 or newer (from nodejs.org or through fnm, nvm or mise) and enable corepack. A distribution package that is older than 22.23.4 fails Astro's engine check and cannot run the TypeScript scripts in `scripts/`. The version used by the Docker image is in `.node-version`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec astro check
pnpm run build:site   # astro build, draft-asset prune, Pagefind index
pnpm run verify       # assertions over dist/
pnpm run markers      # list unfilled [[TODO: …]] markers
pnpm build            # astro check + build:site + markers, the full local build
```

corepack provides the pnpm version pinned in `packageManager` in `package.json`. Locally, lychee, actionlint and zizmor run only as pinned containers, through `./dev.sh links` and `./dev.sh workflows`; in CI lychee comes from the SHA-pinned lychee-action.

If you switch between the Docker and the native install, remove `node_modules` first (`rm -rf node_modules`), because native packages are installed per platform and per Node version.

### Checks and CI

`.github/workflows/checks.yml` runs on pull requests to `main` and on pushes to every other branch (except Dependabot's). It calls one shared action, `.github/actions/site-checks`, which runs in this order:

1. Install from the lockfile
2. Prettier format check
3. ESLint
4. `astro check`
5. Build (`pnpm run build:site`)
6. Offline link and anchor check over `dist/` (lychee)
7. `pnpm verify`: assertions over `dist/` (routes, canonical URLs, no drafts or demo content, search index, structured data), ending with `verify-dist: all {n} checks passed.`
8. The marker check, which only warns

`.github/workflows/deploy.yml` runs on a push to `main` and on manual dispatch. Both of its jobs are skipped unless the ref is `main`, so a dispatch from another branch publishes nothing. It runs the same set with the strict marker check, so the deploy fails while any `[[TODO: …]]` marker remains, and only then uploads `dist/` and publishes it with the official GitHub Pages actions. 

`./dev.sh ci` runs the same steps locally, in the same order. `./dev.sh pnpm markers --strict` reproduces the deploy's marker gate, and `./dev.sh workflows` audits the workflow files.

### Maintenance

Dependabot proposes updates weekly for npm and for GitHub Actions, in grouped pull requests with a seven-day cooldown. TypeScript major versions are ignored, because `astro check` does not support TypeScript 7 yet.

The container image digests are not covered by Dependabot: the `node:22-slim` digest in the `Dockerfile` and the lychee, actionlint and zizmor digests in `dev.sh`. To refresh one:

```sh
docker pull node:22-slim
docker inspect --format '{{index .RepoDigests 0}}' node:22-slim
```

Replace the old `tag@sha256:…` reference with the printed one. Keep the lychee image at the same version as the lychee that CI installs: `LYCHEE_IMAGE` in `dev.sh` and `lycheeVersion` in `.github/actions/site-checks/action.yml` must name the same version (`0.24.2` and `v0.24.2` today). A lychee-action bump does not change the CI version, because it is passed explicitly.

## Authoring

### New content

```sh
./dev.sh new post my-first-post
./dev.sh new note a-short-tip
./dev.sh new project my-tool
```

The command copies a template, sets `draft: true` and prints the path it created. It writes to:

| Type      | File                                 | Date in the file                                      |
| --------- | ------------------------------------ | ----------------------------------------------------- |
| `post`    | `src/content/blog/<year>/<slug>.md`  | `pubDatetime`: now, with offset, in the site timezone |
| `note`    | `src/content/notes/<year>/<slug>.md` | none, notes take their dates from git                 |
| `project` | `src/content/projects/<slug>.md`     | none                                                  |

The year is the current year in the site timezone, read once together with the post date, so the folder year always matches `pubDatetime`. The command stops with an error when `date` is not GNU, or when `starglow.config.ts` has no `timezone:` line or names a zone the host does not know, instead of quietly using UTC. The slug uses lowercase letters, digits and single hyphens. The command never overwrites: when the file, or a file with the same slug and the other extension (`.md` or `.mdx`), exists, it stops and writes nothing. Set `draft: false` when the content is ready to publish.

The templates live outside `src/` and are never built: [templates/post.md](../templates/post.md), [templates/note.md](../templates/note.md) and [templates/project.md](../templates/project.md). Required keys are set; optional keys are present as comments, so remove the `# ` to use one. The schemas are strict: an unknown key, or a misspelled one, fails `astro check`.

Post template fields:

| Field          | Required | Default           | Effect                                                                     |
| -------------- | -------- | ----------------- | -------------------------------------------------------------------------- |
| `title`        | yes      |                   | Page heading, list entries, browser tab                                    |
| `description`  | yes      |                   | Summary on cards and the meta description                                  |
| `pubDatetime`  | yes      | set by `new`      | Publication date with offset; its year must equal the folder year          |
| `tags`         | no       | none              | Labels, each with a page under `/tags/`                                    |
| `draft`        | no       | `true` from `new` | `true` keeps the post out of production builds                             |
| `modDatetime`  | no       | none              | Last update, shown as "Updated" when later than `pubDatetime`              |
| `featured`     | no       | none              | Accepted by the schema, nothing on the site reads it yet                   |
| `hideToc`      | no       | shown             | Hides the inline table of contents                                         |
| `hideEditPost` | no       | shown             | Hides the edit link when edit links are enabled in `starglow.config.ts` |
| `ogImage`      | no       | generated image   | Link preview image, kept next to the post                                  |
| `timezone`     | no       | site timezone     | IANA zone used to read `pubDatetime` for the folder-year check             |
| `canonicalUrl` | no       | this page         | Where the post was first published, see "Canonical and syndication"        |
| `syndication`  | no       | none              | Other places the post was published, shown as an "Also on" line            |
| `author`       | no       | site author       | Overrides the author name                                                  |

Note template fields:

| Field          | Required | Default           | Effect                                               |
| -------------- | -------- | ----------------- | ---------------------------------------------------- |
| `title`        | yes      |                   | Page heading and list entries                        |
| `draft`        | no       | `true` from `new` | `true` keeps the note out of production builds       |
| `description`  | no       | none              | Summary on cards and the meta description            |
| `tags`         | no       | none              | Labels, each with a page under `/tags/`              |
| `updated`      | no       | git date          | Overrides the date taken from the file's git history |
| `canonicalUrl` | no       | this page         | Where the note was first published                   |
| `syndication`  | no       | none              | Other places the note was published                  |

Project template fields:

| Field          | Required | Default             | Effect                                                                                           |
| -------------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------ |
| `title`        | yes      |                     | Card and page heading                                                                            |
| `description`  | yes      |                     | Summary on cards and the meta description                                                        |
| `status`       | yes      | `active` from `new` | `active`, `maintained`, `archived` or `experiment`; `experiment` projects also appear on `/lab/` |
| `draft`        | no       | `true` from `new`   | `true` keeps the project out of production builds                                                |
| `stack`        | no       | none                | Technologies shown as chips                                                                      |
| `githubUrl`    | no       | none                | Source link (http or https)                                                                      |
| `docsUrl`      | no       | none                | Documentation link (http or https)                                                               |
| `websiteUrl`   | no       | none                | Project website (http or https)                                                                  |
| `featured`     | no       | `false`             | Lists the project under "Featured projects" on the homepage and sorts it first                   |
| `relatedPosts` | no       | none                | Posts about the project, as post ids `YYYY/slug`                                                 |

### Posts, notes and projects

- Posts are one file per post at `src/content/blog/YYYY/<kebab-case-slug>.md` (or `.mdx`). The filename is the slug and the post is served at `/blog/YYYY/<slug>/`.
- The folder year must equal the year of `pubDatetime` in the site timezone (`site.timezone`) or in the post's `timezone`. Otherwise `astro check` fails.
- A slug exists once per year folder: `my-post.md` and `my-post.mdx` in the same folder collide.
- Files whose name starts with `_` are not content. Images and other assets can live next to posts, for example in `src/content/blog/2026/_assets/`.
- Notes are one file per note at `src/content/notes/YYYY/<slug>.md` and are served at `/notes/YYYY/<slug>/`. Their dates come from the file's git history unless `updated` is set. Squashing the history to one commit gives every note that commit's date.
- Projects are one file per project at `src/content/projects/<slug>.md` and are served at `/projects/<slug>/`. Every project is listed on `/projects/`, and projects with status `experiment` are also listed on `/lab/`.
- Drafts (`draft: true`) are listed and served only by the dev server, with a "Draft" badge. They are excluded from production builds, including the sitemap, RSS feed, tag pages and search index. The example posts, notes and projects that ship with starglow are published; delete or replace them.
- The `.vscode/starglow.code-snippets` file provides a `frontmatter` snippet for VS Code.

### Callouts and code

GitHub alert syntax renders as a callout. The five types are:

```md
> [!NOTE]
> [!TIP]
> [!IMPORTANT]
> [!WARNING]
> [!CAUTION]
```

Put the text on the following lines of the same quote block. Fenced code blocks get a copy button automatically.

### Placeholders

Text that still has to be written is marked with `[[TODO: what to write]]`. In a Markdown body the marker renders as a highlighted `TODO:` mark with a dashed border in every build, so a leftover is easy to see in `./dev.sh preview`. A marker in frontmatter (a title or a list item, for example) shows as literal text without the highlight. Markers inside code blocks and inline code are ignored, so documentation can show the syntax. Quote a marker in YAML (`title: "[[TODO: title]]"`), because bare double brackets parse as a list. Keep the text of a marker plain: one with emphasis or a link inside (`*like this*`) is not highlighted in the page, but `./dev.sh pnpm markers --strict` still reports it. A marker with only whitespace inside is neither highlighted nor counted. `draft: true` may carry a trailing YAML comment.

`./dev.sh pnpm markers` lists every marker with its file and line. A marker may wrap across a line break or contain a single `]`, and a backslash-escaped backtick does not make it code. Local builds and pull-request checks only warn. The deploy fails while any marker remains. Markers in drafts are not counted, because drafts are never published.

The check also scans the built `dist/**/*.html` (outside `pre` and `code`) for a literal `[[TODO` that the source scan did not report, since `dist/` is what would ship. Strict mode fails on it, and it also fails when `dist/` has no HTML, so run `./dev.sh build` before `./dev.sh pnpm markers --strict`. Warn mode only prints a warning.

### Canonical and syndication

`canonicalUrl` sets the page's one canonical link, for content that was first published elsewhere. The page stays in the sitemap and the Copy link button copies the canonical. `syndication` lists other places where the same content was published as a list of http(s) links, shown as an "Also on" line. Nothing is published automatically: the site is published first, then the copies are linked.

## Configuration

Every variable is optional, and the build needs no network and no external service.

| Variable                          | Required | Default                        | Purpose                                                                                                |
| --------------------------------- | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `SITE_URL`                        | no       | `https://starglow.glowing.space` | The site origin: scheme and host, no path. Sitemap, RSS, canonical URLs and OG tags follow it          |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | no       | unset (no meta tag)            | Google Search Console verification value, rendered as a meta tag on every page when set                |
| `MARKERS_STRICT`                  | no       | unset (warn only)              | `true` makes the marker check fail while any `[[TODO: …]]` marker remains. The deploy workflow sets it |

Set a variable in the shell (`SITE_URL=https://example.org ./dev.sh build`) or copy `.env.example` to `.env` and uncomment or add the line (copying alone changes nothing, because the lines ship commented out). A variable set in the shell wins over `.env`. This table is the reference.

- `SITE_URL` must be an origin only. A value with a path, query or hash fails the build with an error message.
- `PUBLIC_GOOGLE_SITE_VERIFICATION` is public by design, because it ends up in the HTML, but it belongs in the environment and never in a committed file. An empty value renders no meta tag. Compose forwards it, like `SITE_URL`, into the container.
- `MARKERS_STRICT` is not forwarded into the container, and `scripts/check-markers.ts` never reads `.env`. Locally, use `./dev.sh pnpm markers --strict` instead.
- The marker check also reads `GITHUB_ACTIONS`, which GitHub sets on its runners, to print one annotation per marker.

Site metadata, the timezone, social profiles and the optional person fields (job title and description for the homepage structured data) are in `starglow.config.ts`. Placeholder text in the person fields fails the build, and a social profile with an empty `url` renders nowhere.

Look and feel options in `starglow.config.ts`:

| Option                    | Default      | Purpose                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `site.wordmark`           | `site.title` | Text of the pixel wordmark in the header. Page titles, metadata, structured data and the footer keep `site.title` and `site.author`                                                                                                                                                                                                                                                              |
| `site.sourceUrl`          | unset        | Source repository, linked as "source" in the footer                                                                                                                                                                                                                                                                                                                                              |
| `site.sourceBanner`       | unset        | `{ art, message }` printed as an HTML comment right after the doctype of every page. Empty = no comment. Text containing `--` fails the build (it would end the comment)                                                                                                                                                                                                                         |
| `appearance.ambient`      | `"none"`     | Inner light of the header band: `none`, `light` (static glow), `breathe` (10s pulse) or `dawn` (accent-tinted). Static under reduced motion                                                                                                                                                                                                                                                      |
| `appearance.wordmarkGlow` | `false`      | Pulsing accent glow on the wordmark. Off under reduced motion                                                                                                                                                                                                                                                                                                                                    |
| `appearance.statusline`   | `false`      | Vim-style bar at the bottom of post and note pages: source path, `[RO]`, file type and scroll position                                                                                                                                                                                                                                                                                           |
| `appearance.palette`      | `glowing`/`glowing` | `{ dark, light }` palette names. Built in: dark glowing, void, aurora, ember; light glowing, paper, petal, frost, sand |
| `appearance.palettes`     | none         | Your own palettes, `{ dark: { name: Palette }, light: { … } }`, see `src/palettes.ts` |
| `appearance.preview`      | `false`      | Floating panel to switch palettes and effects live (demos); session only |
| `links`                   | `[]`         | 88x31 footer badges, `{ type, url, label?, title? }`. Types with an icon: github, gitlab, codeberg, srht, linkedin, mastodon, bluesky, stack, hackaday, crates, email, rss, sparkle; other types get a generic icon. `url` is http(s), `mailto:` or a site path; an empty `url` renders nothing. Configured `socials` without a badge get one automatically, and profile badges carry `rel="me"` |

Colour palettes live in `src/palettes.ts` and are chosen with `appearance.palette` (custom ones under `appearance.palettes`; `pnpm verify` checks WCAG AA). Fonts, type scale and spacing live in `src/styles/site-theme.css` (badge icon colours are the `--badge-<type>` tokens); the font files are configured in `astro.config.ts`, where the `--font-wordmark` entry selects the wordmark face.

## Deploying to GitHub Pages

None of this is done by the repository. Do it by hand in the GitHub settings of your repository before the first push to `main`.

- [ ] Settings → Pages → Build and deployment → Source: **GitHub Actions**. Do this before the first push to `main`, otherwise the deploy fails at its Pages configuration step.
- [ ] Settings → Environments → `github-pages`: limit deployment branches to `main`, so only the default branch can deploy.
- [ ] Settings → Actions → General: set workflow permissions to "Read repository contents". Optionally also require actions to be pinned to a full-length commit SHA: every action here already is.
- [ ] Turn on Dependabot alerts and Dependabot security updates (under Settings → Advanced Security). `.github/dependabot.yml` only configures version updates.
- [ ] Optional: a ruleset on `main` that requires a pull request and the passing status check `Format, lint, check, build, links, dist assertions` (the `checks` job in `.github/workflows/checks.yml`).
- [ ] Fill every `[[TODO: …]]` marker (`./dev.sh pnpm markers` lists them). The first deploy fails until they are gone, by design.
- [ ] Add the repository variable `SITE_URL` with your origin (Settings → Secrets and variables → Actions → Variables). The deploy build forwards it; unset, the default in `astro.config.ts` is used.
- [ ] Settings → Security: turn on private vulnerability reporting, which `SECURITY.md` links to.
- [ ] Optional, Search Console: add the repository variable `PUBLIC_GOOGLE_SITE_VERIFICATION` with the verification value (Settings → Secrets and variables → Actions → Variables). It is a public meta value, so a variable, not a secret. The deploy build forwards it.
- [ ] Route-name reservation: a repository owned by the account is served under the same host, so never create one named after a top-level path of this site: `404.html`, `_astro`, `about`, `blog`, `contact`, `favicon.svg`, `lab`, `notes`, `og.png`, `pagefind`, `projects`, `robots.txt`, `rss.xml`, `search`, `sitemap-0.xml`, `sitemap-index.xml`, `tags`. `pagefind` and `_astro` hold build output, the rest are routes and files. Regenerate the list with `ls dist` after `./dev.sh build` when sections are added.

Not included yet:

- Giscus comments (needs GitHub Discussions and the Giscus app)
- Cloudflare Web Analytics (needs its token)
- Impressum and Datenschutz pages, before commercial use or before enabling either of the two above

