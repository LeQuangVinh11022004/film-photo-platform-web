import axios from "axios";
import { API_BASE_URL } from "@/services/config";
import { clearAuthToken, getAuthToken } from "@/services/authToken";
import { startApiRequest } from "@/services/loadingState";
import { useAuthStore } from "@/store/authStore";

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
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      releaseRequest(error.config);
      const status = error.response?.status;
      const requestUrl = error.config?.url ?? "";
      const isAuthRequest = requestUrl.includes("/auth/");

      if (typeof window !== "undefined" && !isAuthRequest) {
        if (status === 401) {
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
