interface Column {
  key: string;
  label: string;
}

interface Row {
  id: string;
  values: string[];
}

interface ManagementPageProps {
  title: string;
  totalLabel: string;
  totalCount: string;
  columns: Column[];
  rows: Row[];
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
}

export default function ManagementPage({
  title,
  totalLabel,
  totalCount,
  columns,
  rows,
  isLoading = false,
  errorMessage,
  emptyMessage = "No records found.",
}: ManagementPageProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">{totalCount}</p>
        <p className="mt-1 text-sm text-slate-600">{totalLabel}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-6 text-sm text-slate-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-6 text-sm text-red-600"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-6 text-sm text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.id}-${columns[index]?.key ?? index}`}
                        className="px-3 py-3 text-sm text-slate-700"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
