import type { AxiosRequestConfig, AxiosResponse } from "axios";

type CacheEntry = {
  response: AxiosResponse;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 30_000; // 30 seconds for lists & details
const DASHBOARD_TTL_MS = 45_000; // 45 seconds for dashboards & account profiles
const MAX_CACHE_ENTRIES = 150;

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<AxiosResponse>>();

function serializeParams(params: unknown): string {
  if (!params || typeof params !== "object") return "";
  const entries = Object.entries(params as Record<string, unknown>)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return "";
  return entries.map(([k, v]) => `${k}=${String(v)}`).join("&");
}

export function buildApiCacheKey(
  url: string,
  params: unknown,
  token: string | null,
): string {
  const tokenTag = token ? token.slice(-12) : "anon";
  const normalizedUrl = url.replace(/\/+$/, "");
  const query = serializeParams(params);
  return `${tokenTag}::${normalizedUrl}${query ? `?${query}` : ""}`;
}

export function getTtlForUrl(url: string): number {
  if (/\/(dashboard|account)(\?|$)/i.test(url)) {
    return DASHBOARD_TTL_MS;
  }
  return DEFAULT_TTL_MS;
}

export function getCachedApiResponse(key: string): AxiosResponse | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.response;
}

export function setCachedApiResponse(
  key: string,
  response: AxiosResponse,
  ttlMs: number,
): void {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey !== undefined) responseCache.delete(oldestKey);
  }
  responseCache.set(key, {
    response,
    expiresAt: Date.now() + ttlMs,
  });
}

export function getInFlightApiRequest(key: string): Promise<AxiosResponse> | undefined {
  return inFlightRequests.get(key);
}

export function setInFlightApiRequest(
  key: string,
  promise: Promise<AxiosResponse>,
): void {
  inFlightRequests.set(key, promise);
  promise.finally(() => {
    if (inFlightRequests.get(key) === promise) {
      inFlightRequests.delete(key);
    }
  });
}

function invalidateByPrefixes(prefixes: string[]): void {
  for (const key of responseCache.keys()) {
    const separatorIndex = key.indexOf("::");
    const urlPart = separatorIndex >= 0 ? key.slice(separatorIndex + 2) : key;
    if (prefixes.some((prefix) => urlPart.startsWith(prefix))) {
      responseCache.delete(key);
    }
  }
}

export function invalidateCacheForMutation(url: string | undefined): void {
  if (!url) {
    clearApiCache();
    return;
  }

  const clean = url.split("?")[0].replace(/\/+$/, "");

  if (clean.startsWith("/provider/spaces")) {
    invalidateByPrefixes(["/provider/spaces", "/provider/dashboard", "/provider/service-packages"]);
    return;
  }
  if (clean.startsWith("/provider/equipment")) {
    invalidateByPrefixes(["/provider/equipment", "/provider/dashboard", "/provider/service-packages"]);
    return;
  }
  if (clean.startsWith("/provider/chemicals")) {
    invalidateByPrefixes(["/provider/chemicals", "/provider/service-packages"]);
    return;
  }
  if (clean.startsWith("/provider/maintenance")) {
    invalidateByPrefixes(["/provider/maintenance", "/provider/dashboard"]);
    return;
  }
  if (clean.startsWith("/provider/service-packages") || clean.startsWith("/provider/services")) {
    invalidateByPrefixes(["/provider/service-packages", "/provider/services", "/provider/dashboard"]);
    return;
  }
  if (clean.startsWith("/provider/bookings")) {
    invalidateByPrefixes(["/provider/bookings", "/provider/dashboard", "/provider/spaces"]);
    return;
  }
  if (clean.startsWith("/provider/account")) {
    invalidateByPrefixes(["/provider/account"]);
    return;
  }
  if (clean.startsWith("/admin/")) {
    invalidateByPrefixes(["/admin/"]);
    return;
  }

  invalidateByPrefixes([clean]);
}

export function shouldBypassCache(config?: AxiosRequestConfig): boolean {
  if (typeof window === "undefined") return true;
  const headers = config?.headers as Record<string, unknown> | undefined;
  if (headers && (headers["X-Bypass-Cache"] === "true" || headers["x-bypass-cache"] === "true")) {
    return true;
  }
  return false;
}

export function clearApiCache(): void {
  responseCache.clear();
  inFlightRequests.clear();
}
