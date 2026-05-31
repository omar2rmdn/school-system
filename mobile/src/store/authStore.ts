import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

export type UserRole = "parent" | "teacher" | "supervisor";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  studentId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  getIsAuthenticated: () => boolean;
  getUserRole: () => UserRole | null;
  setAuth: (user: User, accessToken: string) => Promise<void>;
  setStudentId: (studentId: string | null) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const TOKEN_KEY = "access_token";
const USER_KEY = "user_data";
const STUDENT_ID_KEY = "student_id";

export const useAuthStore = create<AuthState>((set, get) => ({
  getIsAuthenticated: () => get().isAuthenticated,
  getUserRole: () => get().user?.role ?? null,
  user: null,
  accessToken: null,
  studentId: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (user: User, accessToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  setStudentId: async (studentId: string | null) => {
    if (studentId) {
      await SecureStore.setItemAsync(STUDENT_ID_KEY, studentId);
    } else {
      await SecureStore.deleteItemAsync(STUDENT_ID_KEY);
    }
    set({ studentId });
  },

  logout: async () => {
    try {
      const token = get().accessToken;
      await axios.post(
        `${BASE_URL}/users/logout`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      await SecureStore.deleteItemAsync(STUDENT_ID_KEY);
      set({
        user: null,
        accessToken: null,
        studentId: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  loadFromStorage: async () => {
    try {
      const [token, userData, studentId] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
        SecureStore.getItemAsync(STUDENT_ID_KEY),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData) as User;
        set({
          user,
          accessToken: token,
          studentId,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load auth from storage:", error);
      set({ isLoading: false });
    }
  },
}));
