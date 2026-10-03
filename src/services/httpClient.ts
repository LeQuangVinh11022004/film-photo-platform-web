import axios from "axios";
import { API_BASE_URL } from "@/services/config";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
