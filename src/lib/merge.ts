import type { Author, MediaPatch, MediaResult, Stats } from "../types";

function defined<T extends object>(value?: T): Partial<T> {
  if (!value) {
    return {};
  }

  const entries = Object.entries(value).filter(
    ([, item]) => item !== undefined && item !== null && item !== ""
  );

  return Object.fromEntries(entries) as Partial<T>;
}

export function mergeDetails(
  base: MediaResult,
  patch: MediaPatch | null
): MediaResult {
  if (!patch) {
    return base;
  }

  const author: Author = {
    ...defined(patch.author),
    ...defined(base.author),
  };

  const stats: Stats = {
    ...defined(base.stats),
    ...defined(patch.stats),
  };

  return {
    ...base,
    caption: base.caption || patch.caption,
    coverUrl: base.coverUrl ?? patch.coverUrl,
    author,
    stats,
  };
}
