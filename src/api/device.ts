import * as SecureStore from "expo-secure-store";
import { absolute, APP_VERSION } from "../config";
import { makeUuid } from "../lib/uuid";

const ID_KEY = "orbit.deviceId";
const TOKEN_KEY = "orbit.token";

let memoryToken: string | null = null;
let pending: Promise<string | null> | null = null;

async function readStore(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeStore(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    return;
  }
}

async function deviceId() {
  const saved = await readStore(ID_KEY);

  if (saved) {
    return saved;
  }

  const fresh = makeUuid();

  await writeStore(ID_KEY, fresh);

  return fresh;
}

async function register(): Promise<string | null> {
  try {
    const response = await fetch(absolute("/api/device/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: await deviceId(),
        platform: "android",
        appVersion: APP_VERSION,
      }),
    });

    const body = (await response.json()) as { ok?: boolean; token?: string };

    if (response.ok && body.ok && typeof body.token === "string") {
      memoryToken = body.token;
      await writeStore(TOKEN_KEY, body.token);

      return body.token;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getToken(force = false) {
  if (!force && memoryToken) {
    return memoryToken;
  }

  if (!force) {
    const saved = await readStore(TOKEN_KEY);

    if (saved) {
      memoryToken = saved;

      return saved;
    }
  }

  if (!pending) {
    pending = register().finally(() => {
      pending = null;
    });
  }

  return pending;
}

export async function authHeaders(force = false): Promise<Record<string, string>> {
  const token = await getToken(force);

  return token ? { Authorization: `Bearer ${token}` } : {};
}
