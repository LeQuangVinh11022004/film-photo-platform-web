function resolveApiBaseUrl(rawUrl: string | undefined): string {
  const trimmed = rawUrl?.trim().replace(/\/+$/, "");
  if (!trimmed) return "/api";
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);