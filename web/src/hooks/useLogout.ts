import api, { authState } from "../lib/api";
import { useAuth } from "../store/auth/context";

export function useLogout() {
  const { setAuth } = useAuth();

  const logout = async () => {
    setAuth(null);
    authState.accessToken = "";
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return logout;
}
