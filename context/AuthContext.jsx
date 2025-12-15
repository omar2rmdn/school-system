import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const API_BASE = "https://edu-spring.runasp.net";

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isLoading: true,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if token is expired or will expire soon (within 30 seconds)
  const isTokenExpired = (token) => {
    try {
      if (!token) return true;
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      // Add 30 second buffer to refresh before actual expiration
      return decoded.exp < currentTime + 30;
    } catch {
      return true;
    }
  };

  // Refresh the access token using refresh token
  const refreshAccessToken = async () => {
    if (isRefreshing) return null; // Prevent multiple simultaneous refresh attempts

    try {
      setIsRefreshing(true);
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const userData = await SecureStore.getItemAsync("userData");

      if (!refreshToken || !userData) {
        await logout();
        return null;
      }

      const response = await axios.post(`${API_BASE}/api/auth/refresh`, {
        refreshToken,
      });

      const {
        token: newToken,
        firstName,
        lasttName,
        email: userEmail,
        id,
        refreshToken: newRefreshToken,
        expiresIn,
        refreshTokenExpiration,
      } = response.data;

      // Decode new token to get roles
      const decoded = jwtDecode(newToken);
      const roles = decoded.roles || [];

      const user = {
        id,
        email: userEmail,
        firstName,
        lastName: lasttName,
        roles,
        token: newToken,
      };

      // Store new credentials
      await SecureStore.setItemAsync("authToken", newToken);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));
      if (newRefreshToken) {
        await SecureStore.setItemAsync("refreshToken", newRefreshToken);
      }
      if (expiresIn) {
        const expirationTime = Date.now() + expiresIn * 1000;
        await SecureStore.setItemAsync(
          "tokenExpiration",
          expirationTime.toString()
        );
      }
      if (refreshTokenExpiration) {
        await SecureStore.setItemAsync(
          "refreshTokenExpiration",
          refreshTokenExpiration
        );
      }

      // Update axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      setAuthState({
        token: newToken,
        user,
        isLoading: false,
      });

      return newToken;
    } catch (error) {
      console.error(
        "Token refresh failed:",
        error.response?.data || error.message
      );
      await logout(); // Force logout if refresh fails
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Setup axios interceptors for automatic token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync("authToken");

        if (token && !isTokenExpired(token)) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/auth/refresh")
        ) {
          originalRequest._retry = true;

          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const userData = await SecureStore.getItemAsync("userData");

        if (token && userData) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            // If token is expired, clear it and require fresh login
            await logout();
            return;
          } else {
            // Token is still valid
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setAuthState({
              token,
              user: JSON.parse(userData),
              isLoading: false,
            });
          }
        } else {
          setAuthState({
            token: null,
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Failed to load token", error);
        setAuthState({
          token: null,
          user: null,
          isLoading: false,
        });
      }
    };

    loadToken();
  }, []);

  // app/context/AuthContext.js
  const login = async (email, password) => {
    try {
      // Normalize email - remove spaces and force lowercase
      const normalizedEmail = email.trim().toLowerCase();

      const response = await axios.post(`${API_BASE}/api/auth`, {
        email: normalizedEmail,
        password,
      });

      // Extract data from response
      const {
        token,
        firstName,
        lasttName,
        email: userEmail,
        id,
        refreshToken,
        expiresIn,
        refreshTokenExpiration,
      } = response.data;

      // Decode token to get roles
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];

      const user = {
        id,
        email: userEmail,
        firstName,
        lastName: lasttName, // Note the double 't' in the backend response
        roles,
        token,
      };

      // Store credentials securely
      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));

      // Store refresh token and expiration data
      if (refreshToken) {
        await SecureStore.setItemAsync("refreshToken", refreshToken);
      }
      if (expiresIn) {
        const expirationTime = Date.now() + expiresIn * 1000;
        await SecureStore.setItemAsync(
          "tokenExpiration",
          expirationTime.toString()
        );
      }
      if (refreshTokenExpiration) {
        await SecureStore.setItemAsync(
          "refreshTokenExpiration",
          refreshTokenExpiration
        );
      }

      // Set axios default headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setAuthState({
        token,
        user,
        isLoading: false,
      });

      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);

      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join("\n");
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async () => {
    // Remove stored credentials
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("userData");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("tokenExpiration");
    await SecureStore.deleteItemAsync("refreshTokenExpiration");

    // Clear axios headers
    delete axios.defaults.headers.common["Authorization"];

    setAuthState({
      token: null,
      user: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshAccessToken,
        isAuthenticated: !!authState.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
