import { useState } from "react";
import ClassFormModal from "../components/modal/class-form-modal";
import DeleteClassModal from "../components/modal/delete-class-modal";
import type { ClassResource } from "../types";
import { useClassesQuery } from "../queries/classes";
import { getQueryErrorMessage } from "../queries/users";
import { ClassCard } from "../components/cards/class-card";

export default function Classes() {
  const { data = [], isLoading, error } = useClassesQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassResource | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassResource | null>(
    null,
  );

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;

  function openCreateModal() {
    setIsCreateOpen(true);
  }

  function openEditModal(resource: ClassResource) {
    setEditingClass(resource);
  }

  function openDeleteModal(resource: ClassResource) {
    setDeletingClass(resource);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Classes</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {data.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">Total classes</p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Class
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Title
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
                      colSpan={2}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : listErrorMessage ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-sm text-red-600">
                      {listErrorMessage}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      No classes found.
                    </td>
                  </tr>
                ) : (
                  data.map((resource) => (
                    <ClassCard
                      key={resource._id}
                      resource={resource}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <ClassFormModal onClose={() => setIsCreateOpen(false)} />
      )}

      {editingClass && (
        <ClassFormModal
          resource={editingClass}
          onClose={() => setEditingClass(null)}
        />
      )}

      {deletingClass && (
        <DeleteClassModal
          resource={deletingClass}
          onClose={() => setDeletingClass(null)}
        />
      )}
    </>
  );
}
