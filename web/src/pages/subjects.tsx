import { type SubmitEvent, useState } from "react";
import DeleteSubjectModal from "../components/modal/delete-subject-modal";
import SubjectFormModal from "../components/modal/subject-form-modal";
import type { SubjectResource } from "../types";
import {
  useCreateSubjectMutation,
  useDeleteSubjectMutation,
  useSubjectsQuery,
  useUpdateSubjectMutation,
} from "../queries/subjects";
import { getQueryErrorMessage } from "../queries/users";

export default function Subjects() {
  const { data = [], isLoading, error } = useSubjectsQuery();
  const createSubjectMutation = useCreateSubjectMutation();
  const updateSubjectMutation = useUpdateSubjectMutation();
  const deleteSubjectMutation = useDeleteSubjectMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectResource | null>(
    null,
  );
  const [deletingSubject, setDeletingSubject] =
    useState<SubjectResource | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createSubjectMutation.error
    ? getQueryErrorMessage(createSubjectMutation.error)
    : undefined;
  const updateErrorMessage = updateSubjectMutation.error
    ? getQueryErrorMessage(updateSubjectMutation.error)
    : undefined;
  const deleteErrorMessage = deleteSubjectMutation.error
    ? getQueryErrorMessage(deleteSubjectMutation.error)
    : undefined;

  async function handleCreateSubmit(event: SubmitEvent) {
    event.preventDefault();

    const title = createTitle.trim();
    if (!title) {
      return;
    }

    await createSubjectMutation.mutateAsync({ title });
    setCreateTitle("");
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingSubject) {
      return;
    }

    const title = editTitle.trim();
    if (!title) {
      return;
    }

    await updateSubjectMutation.mutateAsync({ id: editingSubject._id, title });
    setEditTitle("");
    setEditingSubject(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingSubject) {
      return;
    }

    await deleteSubjectMutation.mutateAsync(deletingSubject._id);
    setDeletingSubject(null);
  }

  function openCreateModal() {
    createSubjectMutation.reset();
    setCreateTitle("");
    setIsCreateOpen(true);
  }

  function openEditModal(resource: SubjectResource) {
    updateSubjectMutation.reset();
    setEditTitle(resource.title);
    setEditingSubject(resource);
  }

  function openDeleteModal(resource: SubjectResource) {
    deleteSubjectMutation.reset();
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
                    <tr key={resource._id}>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {resource.title}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(resource)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(resource)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen ? (
        <SubjectFormModal
          mode="create"
          titleValue={createTitle}
          errorMessage={createErrorMessage}
          isSubmitting={createSubjectMutation.isPending}
          onChange={setCreateTitle}
          onClose={() => {
            createSubjectMutation.reset();
            setCreateTitle("");
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingSubject ? (
        <SubjectFormModal
          mode="edit"
          titleValue={editTitle}
          errorMessage={updateErrorMessage}
          isSubmitting={updateSubjectMutation.isPending}
          onChange={setEditTitle}
          onClose={() => {
            updateSubjectMutation.reset();
            setEditTitle("");
            setEditingSubject(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingSubject ? (
        <DeleteSubjectModal
          resource={deletingSubject}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteSubjectMutation.isPending}
          onClose={() => {
            deleteSubjectMutation.reset();
            setDeletingSubject(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
