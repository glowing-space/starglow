// Pure id builders for content collections. No `astro:` imports, so
// `content.config.ts` can import this module.

export const NOTE_PATH = "src/content/notes";

const NOTE_ENTRY_PATTERN = /^(\d{4})\/([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx?$/;
const NOTE_ID_PATTERN = /^(\d{4})\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

/**
 * Builds the content-collection id of a note: `<year>/<slug>`.
 *
 * `entry` is the file path relative to `src/content/notes/`. Notes must live in
 * a year folder and have a lowercase ASCII kebab-case filename. The id comes
 * from the path alone and never reads frontmatter, so frontmatter cannot change
 * a note URL.
 */
export function noteEntryId(entry: string): string {
  const match = NOTE_ENTRY_PATTERN.exec(entry);
  if (!match) {
    throw new Error(
      `[notes] ${entry}: expected src/content/notes/YYYY/<kebab-case-slug>.md or .mdx`
    );
  }
  const [, year, slug] = match;
  return `${year}/${slug}`;
}

/** Splits a `YYYY/slug` note id into the route params of the note page. */
export function getNoteParts(id: string): { year: string; slug: string } {
  const match = NOTE_ID_PATTERN.exec(id);
  if (!match) {
    throw new Error(`[notes] unexpected note id "${id}"`);
  }
  return { year: match[1], slug: match[2] };
}

export const PROJECT_PATH = "src/content/projects";

const PROJECT_ENTRY_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

/**
 * Builds the content-collection id of a project: the filename slug.
 *
 * `entry` is the file path relative to `src/content/projects/`. Projects live
 * at the top level as lowercase ASCII kebab-case `.md` files, so every project
 * (experiments included) is served at a flat `/projects/<slug>/`. The id comes
 * from the path alone and never reads frontmatter.
 */
export function projectEntryId(entry: string): string {
  const match = PROJECT_ENTRY_PATTERN.exec(entry);
  if (!match) {
    throw new Error(
      `[projects] ${entry}: expected src/content/projects/<kebab-case-slug>.md (top level, Markdown only)`
    );
  }
  return match[1];
}
