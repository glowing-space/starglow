/**
 * The draft rule for notes and projects: drafts show in dev and never in a
 * production build.
 *
 * Posts keep `postFilter` as their only gate (it also hides scheduled posts),
 * and pages never filter drafts inline.
 */
export const isVisible = (entry: { data: { draft?: boolean } }): boolean =>
  import.meta.env.DEV || !entry.data.draft;
