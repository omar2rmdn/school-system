import { Navigate, Outlet } from "react-router";
import { useAuth } from "../store/auth/context";
import type { ProtectedProps } from "../types";

export function Protected({ allowedRoles }: ProtectedProps) {
  const { auth, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
