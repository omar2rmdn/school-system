import { type SubmitEvent, useState } from "react";
import ClassFormModal from "../components/modal/class-form-modal";
import DeleteClassModal from "../components/modal/delete-class-modal";
import type { ClassResource } from "../types";
import {
  useClassesQuery,
  useCreateClassMutation,
  useDeleteClassMutation,
  useUpdateClassMutation,
} from "../queries/classes";
import { getQueryErrorMessage } from "../queries/users";

export default function Classes() {
  const { data = [], isLoading, error } = useClassesQuery();
  const createClassMutation = useCreateClassMutation();
  const updateClassMutation = useUpdateClassMutation();
  const deleteClassMutation = useDeleteClassMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassResource | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassResource | null>(
    null,
  );
  const [createTitle, setCreateTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createClassMutation.error
    ? getQueryErrorMessage(createClassMutation.error)
    : undefined;
  const updateErrorMessage = updateClassMutation.error
    ? getQueryErrorMessage(updateClassMutation.error)
    : undefined;
  const deleteErrorMessage = deleteClassMutation.error
    ? getQueryErrorMessage(deleteClassMutation.error)
    : undefined;

  async function handleCreateSubmit(event: SubmitEvent) {
    event.preventDefault();

    const title = createTitle.trim();
    if (!title) {
      return;
    }

    await createClassMutation.mutateAsync({ title });
    setCreateTitle("");
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingClass) {
      return;
    }

    const title = editTitle.trim();
    if (!title) {
      return;
    }

    await updateClassMutation.mutateAsync({ id: editingClass._id, title });
    setEditTitle("");
    setEditingClass(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingClass) {
      return;
    }

    await deleteClassMutation.mutateAsync(deletingClass._id);
    setDeletingClass(null);
  }

  function openCreateModal() {
    createClassMutation.reset();
    setCreateTitle("");
    setIsCreateOpen(true);
  }

  function openEditModal(resource: ClassResource) {
    updateClassMutation.reset();
    setEditTitle(resource.title);
    setEditingClass(resource);
  }

  function openDeleteModal(resource: ClassResource) {
    deleteClassMutation.reset();
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
        <ClassFormModal
          mode="create"
          titleValue={createTitle}
          errorMessage={createErrorMessage}
          isSubmitting={createClassMutation.isPending}
          onChange={setCreateTitle}
          onClose={() => {
            createClassMutation.reset();
            setCreateTitle("");
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingClass ? (
        <ClassFormModal
          mode="edit"
          titleValue={editTitle}
          errorMessage={updateErrorMessage}
          isSubmitting={updateClassMutation.isPending}
          onChange={setEditTitle}
          onClose={() => {
            updateClassMutation.reset();
            setEditTitle("");
            setEditingClass(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingClass ? (
        <DeleteClassModal
          resource={deletingClass}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteClassMutation.isPending}
          onClose={() => {
            deleteClassMutation.reset();
            setDeletingClass(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
