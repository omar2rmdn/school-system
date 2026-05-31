interface SectionPageProps {
  title: string;
  description: string;
}

function buildStats(title: string) {
  return [
    {
      label: "Section",
      value: title,
    },
    {
      label: "Status",
      value: "Ready",
    },
    {
      label: "Visibility",
      value: "Sidebar linked",
    },
  ];
}

export default function SectionPage({ title, description }: SectionPageProps) {
  const stats = buildStats(title);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-6 sm:px-6">
          <p className="text-sm text-slate-500">Section</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
