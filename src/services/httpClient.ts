import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { API_BASE_URL } from "@/services/config";
import { clearAuthToken, getAuthToken } from "@/services/authToken";
import { startApiRequest } from "@/services/loadingState";
import { useAuthStore } from "@/store/authStore";
import {
  buildApiCacheKey,
  clearApiCache,
  getCachedApiResponse,
  getInFlightApiRequest,
  getTtlForUrl,
  invalidateCacheForMutation,
  setCachedApiResponse,
  setInFlightApiRequest,
  shouldBypassCache,
} from "@/services/apiCache";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const releaseByRequest = new WeakMap<object, () => void>();

httpClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  if (typeof window !== "undefined") releaseByRequest.set(config, startApiRequest());
  return config;
});

function releaseRequest(config: object | undefined) {
  if (!config) return;
  releaseByRequest.get(config)?.();
  releaseByRequest.delete(config);
}

httpClient.interceptors.response.use(
  (response) => {
    releaseRequest(response.config);
    const method = (response.config.method ?? "get").toUpperCase();
    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      invalidateCacheForMutation(response.config.url);
    }
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      releaseRequest(error.config);
      const status = error.response?.status;
      const requestUrl = error.config?.url ?? "";
      const isAuthRequest = requestUrl.includes("/auth/");

      if (typeof window !== "undefined" && !isAuthRequest) {
        if (useAuthStore.getState().isLoggingOut) {
          return Promise.reject(error);
        }
        if (status === 401) {
          clearApiCache();
          clearAuthToken();
          useAuthStore.getState().clearSession();
          useAuthStore.getState().setAuthError("401");
        } else if (status === 403) {
          useAuthStore.getState().setAuthError("403");
        }
      }
    }
    return Promise.reject(error);
  },
);

// Transparent GET response caching + in-flight deduplication
const rawGet = httpClient.get.bind(httpClient);

httpClient.get = (function cachedGet(
  url: string,
  config?: AxiosRequestConfig,
) {
  if (shouldBypassCache(config)) {
    return rawGet(url, config);
  }

  const cacheKey = buildApiCacheKey(url, config?.params, getAuthToken());
  const cached = getCachedApiResponse(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inFlight = getInFlightApiRequest(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const requestPromise = rawGet(url, config).then((response) => {
    setCachedApiResponse(cacheKey, response as AxiosResponse, getTtlForUrl(url));
    return response as AxiosResponse;
  });

  setInFlightApiRequest(cacheKey, requestPromise);
  return requestPromise;
}) as typeof httpClient.get;
