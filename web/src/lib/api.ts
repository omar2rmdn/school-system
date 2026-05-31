import axios from "axios";
import type { AuthSetter, AuthState } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const authState: {
  accessToken: string;
  setAuth: AuthSetter;
} = {
  accessToken: "",
  setAuth: null,
};

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  if (authState.accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${authState.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || originalRequest.url === "/users/refresh") {
      authState.accessToken = "";
      authState.setAuth?.(null);
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await api.get<{ data: AuthState }>("/users/refresh");
      authState.accessToken = data.data.accessToken;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
      authState.setAuth?.((currentAuth) =>
        currentAuth
          ? { ...currentAuth, ...data.data, accessToken: data.data.accessToken }
          : data.data,
      );

      return api(originalRequest);
    } catch (refreshError) {
      authState.accessToken = "";
      authState.setAuth?.(null);
      return Promise.reject(refreshError);
    }
  },
);

export default api;
export { BASE_URL };
