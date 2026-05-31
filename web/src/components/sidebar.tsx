import { NavLink, useLocation } from "react-router";
import { navigationItems } from "../consts";

export default function Sidebar() {
  const location = useLocation();

  return (
    <nav className="grid gap-1 px-3 py-4 sm:grid-cols-2 lg:grid-cols-1">
      {navigationItems.map((item) => {
        const active = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`rounded-lg px-3 py-2.5 transition-colors ${
              active
                ? "bg-slate-100 text-slate-950"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-md ${
                  active
                    ? "bg-white text-slate-950"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-medium">{item.label}</p>
              </div>
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
}
