import { absolute } from "../config";
import { mergeDetails } from "../lib/merge";
import type { MediaPatch, MediaResult } from "../types";
import { authHeaders } from "./device";

type Envelope<T> = { ok: true; data: T } | { ok: false; error?: string; detail?: string };

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, query: string): Promise<T> {
  const target = `${absolute(path)}?url=${encodeURIComponent(query)}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(target, {
        headers: await authHeaders(attempt > 0),
      });
    } catch {
      throw new ApiError("Tidak bisa terhubung ke server. Periksa koneksi internet.");
    }

    if (response.status === 401 && attempt === 0) {
      continue;
    }

    let body: Envelope<T> | null = null;

    try {
      body = (await response.json()) as Envelope<T>;
    } catch {
      body = null;
    }

    if (body && body.ok) {
      return body.data;
    }

    throw new ApiError(
      (body && !body.ok && body.error) || "Gagal memproses link.",
      response.status
    );
  }

  throw new ApiError("Perangkat belum terdaftar. Coba lagi.", 401);
}

export function resolveBase(url: string) {
  return call<MediaResult>("/api/resolve", url);
}

export async function loadDetails(url: string, base: MediaResult) {
  try {
    const patch = await call<MediaPatch>("/api/details", url);

    return mergeDetails(base, patch);
  } catch {
    return base;
  }
}

export async function resolveLink(url: string): Promise<MediaResult> {
  const base = await resolveBase(url);

  return base.detailsPending ? loadDetails(url, base) : base;
}
