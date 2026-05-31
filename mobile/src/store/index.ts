import { AuthSession } from "@/types";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthStore = {
  isHydrated: boolean;
  session: AuthSession | null;
  setHydrated: (value: boolean) => void;
  login: (session: AuthSession) => void;
  logout: () => void;
};

type PersistedAuthState = {
  session: AuthSession | null;
};

const storage = createJSONStorage<PersistedAuthState>(() => ({
  getItem: async (name) => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
}));

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isHydrated: false,
      session: null,
      setHydrated: (value) => set({ isHydrated: value }),
      login: (session) => set({ session }),
      logout: () => set({ session: null }),
    }),
    {
      name: "auth-session",
      partialize: (state): PersistedAuthState => ({ session: state.session }),
      storage,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
