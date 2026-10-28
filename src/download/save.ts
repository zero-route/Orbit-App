import { File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { authHeaders } from "../api/device";
import { absolute, ALBUM_NAME } from "../config";

export type SaveFile = {
  url: string;
  filename: string;
};

export type SaveResult =
  | { ok: true }
  | { ok: false; expired?: boolean; message: string };

const LINK_PREFIX = "/api/ytlink";

function isProxy(url: string) {
  return url.startsWith("/api/");
}

async function resolveTarget(file: SaveFile) {
  if (!isProxy(file.url)) {
    return { url: file.url, headers: {} as Record<string, string> };
  }

  const headers = await authHeaders();

  if (!file.url.startsWith(LINK_PREFIX)) {
    return { url: absolute(file.url), headers };
  }

  const response = await fetch(absolute(file.url), { headers });

  if (response.status === 410 || response.status === 403) {
    throw Object.assign(new Error("expired"), { expired: true });
  }

  const body = (await response.json()) as { ok?: boolean; url?: string; error?: string };

  if (!response.ok || !body.url) {
    throw new Error(body.error ?? "Link unduhan tidak tersedia.");
  }

  return { url: body.url, headers: {} as Record<string, string> };
}

async function toGallery(uri: string) {
  const permission = await MediaLibrary.requestPermissionsAsync(true);

  if (!permission.granted) {
    throw new Error("Izin galeri ditolak. Aktifkan di pengaturan aplikasi.");
  }

  const asset = await MediaLibrary.createAssetAsync(uri);
  const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);

  if (album) {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  } else {
    await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
  }
}

export async function saveOne(file: SaveFile): Promise<SaveResult> {
  try {
    const target = await resolveTarget(file);
    const destination = new File(Paths.cache, file.filename);

    if (destination.exists) {
      destination.delete();
    }

    const downloaded = await File.downloadFileAsync(target.url, destination, {
      headers: target.headers,
    });

    if (downloaded.size < 2048) {
      const head = downloaded.textSync().trimStart();

      if (head.startsWith("{") || head.startsWith("<")) {
        downloaded.delete();

        return { ok: false, expired: true, message: "Link kedaluwarsa, ambil ulang." };
      }
    }

    await toGallery(downloaded.uri);
    downloaded.delete();

    return { ok: true };
  } catch (error) {
    if (error && typeof error === "object" && "expired" in error) {
      return { ok: false, expired: true, message: "Link kedaluwarsa, ambil ulang." };
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal mengunduh.",
    };
  }
}
