import { useEffect, useState, type ReactNode } from "react";
import api, { authState } from "../../lib/api";
import type { AuthState } from "../../types";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    authState.accessToken = auth?.accessToken || "";
  }, [auth?.accessToken]);

  useEffect(() => {
    authState.setAuth = setAuth;

    return () => {
      authState.setAuth = null;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      try {
        const { data } = await api.get<{ data: AuthState }>("/users/refresh");

        if (!ignore) {
          setAuth(data.data.user.role === "admin" ? data.data : null);
        }
      } catch {
        if (!ignore) {
          setAuth(null);
        }
      } finally {
        if (!ignore) {
          setIsReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}
