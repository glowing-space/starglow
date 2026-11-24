import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCallouts from "rehype-callouts";
import { rehypeBlockLabels } from "./src/utils/rehypeBlockLabels";
import { rehypeTableWrapper } from "./src/utils/rehypeTableWrapper";
import { rehypeTodoMarkers } from "./src/utils/rehypeTodoMarkers";
import en from "./src/i18n/lang/en";
import { tplStr } from "./src/i18n/format";
import { existsSync } from "node:fs";
import config from "./starglow.config";

// Single source of the site origin. Override per build with SITE_URL (shell or
// .env); the default is the Starglow demo origin; set your own.
if (existsSync(".env")) process.loadEnvFile(".env");
const SITE_URL = process.env.SITE_URL || "https://starglow.glowing.space";

const siteUrl = (() => {
  try {
    return new URL(SITE_URL);
  } catch {
    throw new Error(
      `SITE_URL must be an absolute http(s) origin, got "${SITE_URL}"`
    );
  }
})();
if (
  !["http:", "https:"].includes(siteUrl.protocol) ||
  siteUrl.pathname !== "/" ||
  siteUrl.search ||
  siteUrl.hash
) {
  throw new Error(
    `SITE_URL must be an http(s) origin without path, query or hash, got "${SITE_URL}"`
  );
}

// Plain text of a hast node (hast-util-to-string is not a direct dependency).
type HastNode = { type: string; value?: string; children?: HastNode[] };
const hastText = (node: HastNode): string =>
  node.type === "text"
    ? (node.value ?? "")
    : (node.children ?? []).map(hastText).join("");

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !/\/archives\/?$/.test(page),
    }),
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    // Order matters: heading ids first (anchors link to them), anchors before
    // callouts, block labels and TODO markers after callouts, table wrapper
    // last. Shiki runs before all of them. MDX inherits this processor.
    processor: unified({
      rehypePlugins: [
        rehypeHeadingIds,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            test: ["h2", "h3", "h4", "h5", "h6"],
            properties: (node: HastNode) => ({
              className: ["heading-link"],
              dataPagefindIgnore: true,
              ariaLabel: tplStr(en.a11y.headingLink, {
                heading: hastText(node),
              }),
            }),
            content: {
              type: "element",
              tagName: "span",
              properties: { ariaHidden: "true" },
              children: [{ type: "text", value: "#" }],
            },
          },
        ],
        [rehypeCallouts, { theme: "github" }],
        rehypeBlockLabels,
        rehypeTodoMarkers,
        [rehypeTableWrapper, { label: en.a11y.scrollableTable }],
      ],
    }),
    shikiConfig: {
      themes: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
      defaultColor: false,
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.local(),
      fallbacks: ["system-ui", "sans-serif"],
      display: "swap",
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: [
              "./src/assets/fonts/inter-latin-400-normal.woff2",
              "./src/assets/fonts/inter-latin-400-normal.woff",
            ],
          },
          {
            weight: 400,
            style: "italic",
            src: ["./src/assets/fonts/inter-latin-400-italic.woff2"],
          },
          {
            weight: 600,
            style: "normal",
            src: [
              "./src/assets/fonts/inter-latin-600-normal.woff2",
              "./src/assets/fonts/inter-latin-600-normal.woff",
            ],
          },
          {
            weight: 600,
            style: "italic",
            src: ["./src/assets/fonts/inter-latin-600-italic.woff2"],
          },
        ],
      },
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.local(),
      fallbacks: ["ui-monospace", "monospace"],
      display: "swap",
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/jetbrains-mono-latin-400-normal.woff2"],
          },
          {
            weight: 400,
            style: "italic",
            src: ["./src/assets/fonts/jetbrains-mono-latin-400-italic.woff2"],
          },
        ],
      },
    },
    {
      // The wordmark face (site title in the header). Replace name and src to
      // swap it; only its Latin subset ships.
      name: "Pixelify Sans",
      cssVariable: "--font-wordmark",
      provider: fontProviders.local(),
      fallbacks: ["monospace"],
      display: "swap",
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/pixelify-sans-latin-400-normal.woff2"],
          },
        ],
      },
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
