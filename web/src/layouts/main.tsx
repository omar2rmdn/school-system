import { Outlet, useNavigate } from "react-router";
import { LogOut, UserCircle } from "lucide-react";
import { useLogout } from "../hooks/useLogout";
import { useAuth } from "../store/auth/context";

export default function MainLayout() {
  const { auth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <h1 className="text-xl font-semibold text-slate-950">
            Admin Console
          </h1>

          <div className="group relative self-start lg:self-auto">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="User menu"
            >
              <UserCircle className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <div className="absolute right-auto z-10 mt-2 hidden w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-lg group-focus-within:block group-hover:block lg:right-0">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-950">
                  {auth?.user.firstName} {auth?.user.lastName}
                </p>
                <p className="text-sm text-slate-600">{auth?.user.email}</p>
                <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase text-slate-600">
                  {auth?.user.role}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 flex w-full items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
