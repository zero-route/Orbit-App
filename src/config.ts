export const API_URL = "https://orbit-software-zeta.vercel.app";

export const APP_VERSION = "0.1.0";

export const ALBUM_NAME = "Orbit";

export function absolute(path: string) {
  return /^https?:\/\//i.test(path) ? path : `${API_URL.replace(/\/+$/, "")}${path}`;
}
