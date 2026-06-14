import { useState } from "react";
import DeleteSubjectModal from "../components/modal/delete-subject-modal";
import SubjectFormModal from "../components/modal/subject-form-modal";
import type { SubjectResource } from "../types";
import { useSubjectsQuery } from "../queries/subjects";
import { getQueryErrorMessage } from "../queries/users";
import { SubjectCard } from "../components/cards/subject-card";

export default function Subjects() {
  const { data = [], isLoading, error } = useSubjectsQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectResource | null>(
    null,
  );
  const [deletingSubject, setDeletingSubject] =
    useState<SubjectResource | null>(null);

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;

  function openCreateModal() {
    setIsCreateOpen(true);
  }

  function openEditModal(resource: SubjectResource) {
    setEditingSubject(resource);
  }

  function openDeleteModal(resource: SubjectResource) {
    setDeletingSubject(resource);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Subjects</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {data.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">Total subjects</p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Subject
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
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  data.map((resource) => (
                    <SubjectCard
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

      {isCreateOpen ? (
        <SubjectFormModal
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editingSubject ? (
        <SubjectFormModal
          resource={editingSubject}
          onClose={() => setEditingSubject(null)}
        />
      ) : null}

      {deletingSubject ? (
        <DeleteSubjectModal
          resource={deletingSubject}
          onClose={() => setDeletingSubject(null)}
        />
      ) : null}
    </>
  );
}
