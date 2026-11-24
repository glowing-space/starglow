import { execFileSync } from "node:child_process";

const cache = new Map<string, Date>();

/**
 * Author date of the last commit that touched `filePath`, or `undefined`.
 * The author date survives amend, rebase and cherry-pick; the committer date
 * does not.
 *
 * Never throws: git missing, not a repository or an untracked file all return
 * `undefined`, so the build never depends on git. The path goes to git as one
 * argument after `--` (no shell, no option parsing), so a crafted filename
 * cannot inject a command or an option.
 *
 * Only found dates are memoised. A file that was untracked when first asked
 * (dev server running while the note is still being written) is looked up again
 * once it is committed.
 */
export function getGitLastModified(
  filePath: string | undefined
): Date | undefined {
  if (!filePath) return undefined;
  const cached = cache.get(filePath);
  if (cached) return cached;

  let date: Date | undefined;
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%aI", "--", filePath],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    const parsed = out ? new Date(out) : undefined;
    date = parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
  } catch {
    date = undefined;
  }

  if (date) cache.set(filePath, date);
  return date;
}
