import { type SubmitEvent, useState } from "react";
import DeleteParentModal from "../components/modal/delete-parent-modal";
import ParentFormModal from "../components/modal/parent-form-modal";
import {
  getQueryErrorMessage,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../queries/users";
import type { ParentFormValues, User } from "../types";

const emptyParentFormValues: ParentFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

export default function Parents() {
  const { data: parents = [], isLoading, error } = useUsersQuery("parent");
  const createParentMutation = useCreateUserMutation();
  const updateParentMutation = useUpdateUserMutation();
  const deleteParentMutation = useDeleteUserMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<User | null>(null);
  const [deletingParent, setDeletingParent] = useState<User | null>(null);
  const [createValues, setCreateValues] = useState<ParentFormValues>(
    emptyParentFormValues,
  );
  const [editValues, setEditValues] = useState<ParentFormValues>(
    emptyParentFormValues,
  );

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createParentMutation.error
    ? getQueryErrorMessage(createParentMutation.error)
    : undefined;
  const updateErrorMessage = updateParentMutation.error
    ? getQueryErrorMessage(updateParentMutation.error)
    : undefined;
  const deleteErrorMessage = deleteParentMutation.error
    ? getQueryErrorMessage(deleteParentMutation.error)
    : undefined;

  async function handleCreateSubmit(event: SubmitEvent) {
    event.preventDefault();

    const firstName = createValues.firstName.trim();
    const lastName = createValues.lastName.trim();
    const email = createValues.email.trim();
    const phone = createValues.phone.trim();
    const password = createValues.password.trim();

    if (!firstName || !lastName || !email || !phone || !password) {
      return;
    }

    await createParentMutation.mutateAsync({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "parent",
    });
    setCreateValues(emptyParentFormValues);
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingParent) {
      return;
    }

    const firstName = editValues.firstName.trim();
    const lastName = editValues.lastName.trim();
    const email = editValues.email.trim();
    const phone = editValues.phone.trim();
    const password = editValues.password.trim();

    if (!firstName || !lastName || !email || !phone) {
      return;
    }

    await updateParentMutation.mutateAsync({
      id: editingParent._id,
      firstName,
      lastName,
      email,
      phone,
      role: "parent",
      ...(password ? { password } : {}),
    });
    setEditValues(emptyParentFormValues);
    setEditingParent(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingParent) {
      return;
    }

    await deleteParentMutation.mutateAsync(deletingParent._id);
    setDeletingParent(null);
  }

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
              onClick={() => {
                createParentMutation.reset();
                setCreateValues(emptyParentFormValues);
                setIsCreateOpen(true);
              }}
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
                    <tr key={parent._id}>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {parent.firstName} {parent.lastName}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {parent.role}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {parent.email}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {parent.phone}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateParentMutation.reset();
                              setEditValues({
                                firstName: parent.firstName,
                                lastName: parent.lastName,
                                email: parent.email,
                                phone: parent.phone,
                                password: "",
                              });
                              setEditingParent(parent);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteParentMutation.reset();
                              setDeletingParent(parent);
                            }}
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
        <ParentFormModal
          mode="create"
          values={createValues}
          errorMessage={createErrorMessage}
          isSubmitting={createParentMutation.isPending}
          onValuesChange={setCreateValues}
          onClose={() => {
            createParentMutation.reset();
            setCreateValues(emptyParentFormValues);
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingParent ? (
        <ParentFormModal
          mode="edit"
          values={editValues}
          errorMessage={updateErrorMessage}
          isSubmitting={updateParentMutation.isPending}
          onValuesChange={setEditValues}
          onClose={() => {
            updateParentMutation.reset();
            setEditValues(emptyParentFormValues);
            setEditingParent(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingParent ? (
        <DeleteParentModal
          parent={deletingParent}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteParentMutation.isPending}
          onClose={() => {
            deleteParentMutation.reset();
            setDeletingParent(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
