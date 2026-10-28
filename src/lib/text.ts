export function formatCount(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "-";
  }

  const units: Array<[number, string]> = [
    [1_000_000_000, "M"],
    [1_000_000, "jt"],
    [1_000, "rb"],
  ];

  for (const [size, label] of units) {
    if (value >= size) {
      const scaled = value / size;
      const text = scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1);

      return `${text.replace(/\.0$/, "").replace(".", ",")} ${label}`;
    }
  }

  return String(Math.round(value));
}

export function formatDuration(seconds?: number) {
  if (seconds === undefined || seconds === null || seconds < 0) {
    return "";
  }

  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${minutes}:${pad(secs)}`;
}

function tagPattern() {
  try {
    return new RegExp("#[\\p{L}\\p{N}_]+", "gu");
  } catch {
    return new RegExp("#[A-Za-z0-9_]+", "g");
  }
}

export function splitCaption(raw?: string) {
  if (!raw) {
    return { text: "", tags: [] as string[] };
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const match of raw.match(tagPattern()) ?? []) {
    const key = match.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      tags.push(match);
    }
  }

  const text = raw
    .replace(tagPattern(), " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();

  return { text, tags };
}
