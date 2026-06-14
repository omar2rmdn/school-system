import { useState } from "react";
import DeleteSupervisorModal from "../components/modal/delete-supervisor-modal";
import SupervisorFormModal, { emptySupervisorFormValues } from "../components/modal/supervisor-form-modal";
import {
  getQueryErrorMessage,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../queries/users";
import type { SupervisorFormValues, User } from "../types";
import { SupervisorCard } from "../components/cards/supervisor-card";

export default function Supervisors() {
  const {
    data: supervisors = [],
    isLoading,
    error,
  } = useUsersQuery("supervisor");
  const createSupervisorMutation = useCreateUserMutation();
  const updateSupervisorMutation = useUpdateUserMutation();
  const deleteSupervisorMutation = useDeleteUserMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<User | null>(null);
  const [deletingSupervisor, setDeletingSupervisor] = useState<User | null>(
    null,
  );

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createSupervisorMutation.error
    ? getQueryErrorMessage(createSupervisorMutation.error)
    : undefined;
  const updateErrorMessage = updateSupervisorMutation.error
    ? getQueryErrorMessage(updateSupervisorMutation.error)
    : undefined;
  const deleteErrorMessage = deleteSupervisorMutation.error
    ? getQueryErrorMessage(deleteSupervisorMutation.error)
    : undefined;

  async function handleCreateSubmit(values: SupervisorFormValues) {
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const password = values.password.trim();

    if (!firstName || !lastName || !email || !phone || !password) {
      return;
    }

    await createSupervisorMutation.mutateAsync({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "supervisor",
    });
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(values: SupervisorFormValues) {
    if (!editingSupervisor) {
      return;
    }

    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const password = values.password.trim();

    if (!firstName || !lastName || !email || !phone) {
      return;
    }

    await updateSupervisorMutation.mutateAsync({
      id: editingSupervisor._id,
      firstName,
      lastName,
      email,
      phone,
      role: "supervisor",
      ...(password ? { password } : {}),
    });
    setEditingSupervisor(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingSupervisor) {
      return;
    }

    await deleteSupervisorMutation.mutateAsync(deletingSupervisor._id);
    setDeletingSupervisor(null);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Supervisors</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {supervisors.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">Total supervisors</p>
            </div>

            <button
              type="button"
              onClick={() => {
                createSupervisorMutation.reset();
                setIsCreateOpen(true);
              }}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Supervisor
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Supervisor
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
                ) : supervisors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      No supervisors found.
                    </td>
                  </tr>
                ) : (
                  supervisors.map((supervisor) => (
                    <SupervisorCard
                      key={supervisor._id}
                      supervisor={supervisor}
                      onEdit={(sup) => {
                        updateSupervisorMutation.reset();
                        setEditingSupervisor(sup);
                      }}
                      onDelete={(sup) => {
                        deleteSupervisorMutation.reset();
                        setDeletingSupervisor(sup);
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen ? (
        <SupervisorFormModal
          mode="create"
          initialValues={emptySupervisorFormValues}
          errorMessage={createErrorMessage}
          isSubmitting={createSupervisorMutation.isPending}
          onClose={() => {
            createSupervisorMutation.reset();
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingSupervisor ? (
        <SupervisorFormModal
          mode="edit"
          initialValues={{
            firstName: editingSupervisor.firstName,
            lastName: editingSupervisor.lastName,
            email: editingSupervisor.email,
            phone: editingSupervisor.phone,
            password: "",
          }}
          errorMessage={updateErrorMessage}
          isSubmitting={updateSupervisorMutation.isPending}
          onClose={() => {
            updateSupervisorMutation.reset();
            setEditingSupervisor(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingSupervisor ? (
        <DeleteSupervisorModal
          supervisor={deletingSupervisor}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteSupervisorMutation.isPending}
          onClose={() => {
            deleteSupervisorMutation.reset();
            setDeletingSupervisor(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
