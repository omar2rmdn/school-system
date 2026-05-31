import { router } from "expo-router";
import axios from "axios";
import { useAuthStore } from "@/store";

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().session?.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.get(`${BASE_URL}/users/refresh`, {
          withCredentials: true,
        });

        const { accessToken } = response.data.data;
        const currentSession = useAuthStore.getState().session;

        if (currentSession) {
          useAuthStore.getState().login({
            ...currentSession,
            accessToken,
          });
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        router.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      router.replace("/login");
    }

    return Promise.reject(error);
  },
);
