import { type FormEvent, useState } from "react";
import type { TitledResource } from "../types";
import {
  useCreateSubjectMutation,
  useDeleteSubjectMutation,
  useSubjectsQuery,
  useUpdateSubjectMutation,
} from "../queries/subjects";
import { getQueryErrorMessage } from "../queries/users";

interface SubjectFormModalProps {
  mode: "create" | "edit";
  titleValue: string;
  errorMessage?: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

interface DeleteSubjectModalProps {
  resource: TitledResource;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function SubjectFormModal({
  mode,
  titleValue,
  errorMessage,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: SubjectFormModalProps) {
  const heading = mode === "create" ? "Add Subject" : "Edit Subject";
  const submitLabel = mode === "create" ? "Create" : "Save Changes";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{heading}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the subject title.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="subject-title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Title
            </label>
            <input
              id="subject-title"
              value={titleValue}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Subject title"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              autoFocus
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteSubjectModal({
  resource,
  errorMessage,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteSubjectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-950">Delete Subject</h2>
        <p className="mt-2 text-sm text-slate-600">
          Delete <span className="font-semibold text-slate-900">{resource.title}</span>?
          This action cannot be undone.
        </p>

        {errorMessage ? (
          <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Subjects() {
  const { data = [], isLoading, error } = useSubjectsQuery();
  const createSubjectMutation = useCreateSubjectMutation();
  const updateSubjectMutation = useUpdateSubjectMutation();
  const deleteSubjectMutation = useDeleteSubjectMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<TitledResource | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<TitledResource | null>(null);
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

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = createTitle.trim();
    if (!title) {
      return;
    }

    await createSubjectMutation.mutateAsync({ title });
    setCreateTitle("");
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
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

  function openEditModal(resource: TitledResource) {
    updateSubjectMutation.reset();
    setEditTitle(resource.title);
    setEditingSubject(resource);
  }

  function openDeleteModal(resource: TitledResource) {
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
                    <td colSpan={2} className="px-3 py-6 text-sm text-slate-500">
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
                    <td colSpan={2} className="px-3 py-6 text-sm text-slate-500">
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
