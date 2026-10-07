import axios from "axios";
import { API_BASE_URL } from "@/services/config";
import { startApiRequest } from "@/services/loadingState";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const releaseByRequest = new WeakMap<object, () => void>();

httpClient.interceptors.request.use((config) => {
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
    if (axios.isAxiosError(error)) releaseRequest(error.config);
    return Promise.reject(error);
  },
);
