import { type SubmitEvent, useState } from "react";
import AdminFormModal from "../components/modal/admin-form-modal";
import DeleteAdminModal from "../components/modal/delete-admin-modal";
import {
  getQueryErrorMessage,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../queries/users";
import { useAuth } from "../store/auth/context";
import type { AdminFormValues, User } from "../types";

const emptyAdminFormValues: AdminFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

export default function Admins() {
  const { auth } = useAuth();
  const { data: admins = [], isLoading, error } = useUsersQuery("admin");
  const createAdminMutation = useCreateUserMutation();
  const updateAdminMutation = useUpdateUserMutation();
  const deleteAdminMutation = useDeleteUserMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<User | null>(null);
  const [createValues, setCreateValues] =
    useState<AdminFormValues>(emptyAdminFormValues);
  const [editValues, setEditValues] =
    useState<AdminFormValues>(emptyAdminFormValues);

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createAdminMutation.error
    ? getQueryErrorMessage(createAdminMutation.error)
    : undefined;
  const updateErrorMessage = updateAdminMutation.error
    ? getQueryErrorMessage(updateAdminMutation.error)
    : undefined;
  const deleteErrorMessage = deleteAdminMutation.error
    ? getQueryErrorMessage(deleteAdminMutation.error)
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

    await createAdminMutation.mutateAsync({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "admin",
    });
    setCreateValues(emptyAdminFormValues);
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingAdmin) {
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

    await updateAdminMutation.mutateAsync({
      id: editingAdmin._id,
      firstName,
      lastName,
      email,
      phone,
      role: "admin",
      ...(password ? { password } : {}),
    });
    setEditValues(emptyAdminFormValues);
    setEditingAdmin(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingAdmin) {
      return;
    }

    await deleteAdminMutation.mutateAsync(deletingAdmin._id);
    setDeletingAdmin(null);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Admins</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {admins.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">Total admins</p>
            </div>

            <button
              type="button"
              onClick={() => {
                createAdminMutation.reset();
                setCreateValues(emptyAdminFormValues);
                setIsCreateOpen(true);
              }}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Admin
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Admin
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
                ) : admins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      No admins found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => {
                    const isCurrentAdmin = auth?.user._id === admin._id;

                    return (
                      <tr key={admin._id}>
                        <td className="px-3 py-3 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <span>
                              {admin.firstName} {admin.lastName}
                            </span>
                            {isCurrentAdmin ? (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                Me
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700">
                          {admin.role}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700">
                          {admin.email}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700">
                          {admin.phone}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                updateAdminMutation.reset();
                                setEditValues({
                                  firstName: admin.firstName,
                                  lastName: admin.lastName,
                                  email: admin.email,
                                  phone: admin.phone,
                                  password: "",
                                });
                                setEditingAdmin(admin);
                              }}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            {isCurrentAdmin ? null : (
                              <button
                                type="button"
                                onClick={() => {
                                  deleteAdminMutation.reset();
                                  setDeletingAdmin(admin);
                                }}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen ? (
        <AdminFormModal
          mode="create"
          values={createValues}
          errorMessage={createErrorMessage}
          isSubmitting={createAdminMutation.isPending}
          onValuesChange={setCreateValues}
          onClose={() => {
            createAdminMutation.reset();
            setCreateValues(emptyAdminFormValues);
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingAdmin ? (
        <AdminFormModal
          mode="edit"
          values={editValues}
          errorMessage={updateErrorMessage}
          isSubmitting={updateAdminMutation.isPending}
          onValuesChange={setEditValues}
          onClose={() => {
            updateAdminMutation.reset();
            setEditValues(emptyAdminFormValues);
            setEditingAdmin(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingAdmin ? (
        <DeleteAdminModal
          admin={deletingAdmin}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteAdminMutation.isPending}
          onClose={() => {
            deleteAdminMutation.reset();
            setDeletingAdmin(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
