import { type SubmitEvent, useState } from "react";
import DeleteSupervisorModal from "../components/modal/delete-supervisor-modal";
import SupervisorFormModal from "../components/modal/supervisor-form-modal";
import {
  getQueryErrorMessage,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../queries/users";
import type { SupervisorFormValues, User } from "../types";

const emptyForm: SupervisorFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

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
  const [createValues, setCreateValues] =
    useState<SupervisorFormValues>(emptyForm);
  const [editValues, setEditValues] = useState<SupervisorFormValues>(emptyForm);

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

    await createSupervisorMutation.mutateAsync({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "supervisor",
    });
    setCreateValues(emptyForm);
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingSupervisor) {
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

    await updateSupervisorMutation.mutateAsync({
      id: editingSupervisor._id,
      firstName,
      lastName,
      email,
      phone,
      role: "supervisor",
      ...(password ? { password } : {}),
    });
    setEditValues(emptyForm);
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
                setCreateValues(emptyForm);
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
                    <tr key={supervisor._id}>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {supervisor.firstName} {supervisor.lastName}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {supervisor.role}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {supervisor.email}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {supervisor.phone}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateSupervisorMutation.reset();
                              setEditValues({
                                firstName: supervisor.firstName,
                                lastName: supervisor.lastName,
                                email: supervisor.email,
                                phone: supervisor.phone,
                                password: "",
                              });
                              setEditingSupervisor(supervisor);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteSupervisorMutation.reset();
                              setDeletingSupervisor(supervisor);
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
        <SupervisorFormModal
          mode="create"
          values={createValues}
          errorMessage={createErrorMessage}
          isSubmitting={createSupervisorMutation.isPending}
          onValuesChange={setCreateValues}
          onClose={() => {
            createSupervisorMutation.reset();
            setCreateValues(emptyForm);
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingSupervisor ? (
        <SupervisorFormModal
          mode="edit"
          values={editValues}
          errorMessage={updateErrorMessage}
          isSubmitting={updateSupervisorMutation.isPending}
          onValuesChange={setEditValues}
          onClose={() => {
            updateSupervisorMutation.reset();
            setEditValues(emptyForm);
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
