const AUTH_TOKEN_KEY = "film-photo.auth-token";
const AUTH_EXPIRY_KEY = "film-photo.auth-expiry";

let inMemoryToken: string | null = null;
let inMemoryExpiry: string | null = null;

export function getAuthToken() {
  if (typeof window === "undefined") return inMemoryToken;
  let token = inMemoryToken;
  let expiry = inMemoryExpiry;

  try {
    token ??= window.localStorage.getItem(AUTH_TOKEN_KEY);
    expiry ??= window.localStorage.getItem(AUTH_EXPIRY_KEY);
  } catch {
    return token;
  }

  if (token && expiry && Date.parse(expiry) <= Date.now()) {
    clearAuthToken();
    return null;
  }
  return token;
}

export function setAuthToken(token: string, expiresAtUtc?: string | null) {
  inMemoryToken = token;
  if (expiresAtUtc !== undefined) inMemoryExpiry = expiresAtUtc;
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (expiresAtUtc) window.localStorage.setItem(AUTH_EXPIRY_KEY, expiresAtUtc);
    else if (expiresAtUtc === null) window.localStorage.removeItem(AUTH_EXPIRY_KEY);
  } catch {
    // Storage unavailable (private mode, quota, ...) - keep the in-memory token only.
  }
}

export function clearAuthToken() {
  inMemoryToken = null;
  inMemoryExpiry = null;
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_EXPIRY_KEY);
  } catch {
    // Ignore storage errors when clearing the token.
  }
}
