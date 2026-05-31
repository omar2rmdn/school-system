import { createContext, useContext } from "react";
import type { AuthState } from "../../types";

interface AuthContextType {
  auth: AuthState | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthState | null>>;
  isReady: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
