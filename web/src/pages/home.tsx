import { Link } from "react-router";
import { navigationItems } from "../consts";

export default function Home() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Overview</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
          Welcome to the school admin console
        </h2>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-950">Quick access</h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Open</p>
                    <p className="text-lg font-semibold text-slate-950">
                      {item.label}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
