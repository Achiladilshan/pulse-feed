import axios from "axios";
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_KEY;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (config.headers!["NO-TOKEN"]) return config;

  if (BEARER_TOKEN) config.headers!["Authorization"] = `Bearer ${BEARER_TOKEN}`;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - Token might be invalid or expired.");
    }
    return Promise.reject(error);
  },
);
