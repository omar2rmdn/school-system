import { useState } from "react";
import DeleteParentModal from "../components/modal/delete-parent-modal";
import ParentFormModal from "../components/modal/parent-form-modal";
import { getQueryErrorMessage, useUsersQuery } from "../queries/users";
import type { User } from "../types";
import { ParentCard } from "../components/cards/parent-card";

export default function Parents() {
  const { data: parents = [], isLoading, error } = useUsersQuery("parent");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<User | null>(null);
  const [deletingParent, setDeletingParent] = useState<User | null>(null);

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Parents</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {parents.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">Total parents</p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Parent
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Parent
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : listErrorMessage ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-sm text-red-600">
                      {listErrorMessage}
                    </td>
                  </tr>
                ) : parents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      No parents found.
                    </td>
                  </tr>
                ) : (
                  parents.map((parent) => (
                    <ParentCard
                      key={parent._id}
                      parent={parent}
                      onEdit={setEditingParent}
                      onDelete={setDeletingParent}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <ParentFormModal onClose={() => setIsCreateOpen(false)} />
      )}

      {editingParent && (
        <ParentFormModal
          parent={editingParent}
          onClose={() => setEditingParent(null)}
        />
      )}

      {deletingParent && (
        <DeleteParentModal
          parent={deletingParent}
          onClose={() => setDeletingParent(null)}
        />
      )}
    </>
  );
}
