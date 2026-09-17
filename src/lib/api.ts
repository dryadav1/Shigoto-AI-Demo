/**
 * Same-origin API client with access-token auth + silent refresh.
 * - Access token lives in memory only (never persisted).
 * - Refresh token lives in an httpOnly cookie (set by the server).
 * - On 401 the client attempts one refresh + retry before failing.
 */

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(status: number, data: Record<string, unknown>) {
    super(`API ${status}`);
    this.status = status;
    this.data = data;
  }
}

let accessToken: string | null = null;
let refreshFlight: Promise<boolean> | null = null;

export function setAccessToken(t: string | null) { accessToken = t; }

async function doRefresh(): Promise<boolean> {
  try {
    const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" });
    if (!r.ok) return false;
    const d = await r.json();
    accessToken = d.accessToken ?? null;
    return !!accessToken;
  } catch {
    return false;
  }
}

interface Opts extends Omit<RequestInit, "body" | "headers"> {
  auth?: boolean; // default true
  body?: unknown;
  headers?: Record<string, string>;
}

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const { auth = true, ...init } = opts;
  const send = (token: string | null) =>
    fetch(path, {
      ...init,
      credentials: "same-origin",
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      headers: {
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  let res = await send(accessToken);
  if (res.status === 401 && auth) {
    if (!refreshFlight) refreshFlight = doRefresh().finally(() => { refreshFlight = null; });
    const ok = await refreshFlight;
    if (ok) res = await send(accessToken);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
