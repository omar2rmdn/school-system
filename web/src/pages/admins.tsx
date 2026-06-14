import { useState } from "react";
import AdminFormModal from "../components/modal/admin-form-modal";
import DeleteAdminModal from "../components/modal/delete-admin-modal";
import { getQueryErrorMessage, useUsersQuery } from "../queries/users";
import { useAuth } from "../store/auth/context";
import type { User } from "../types";
import { AdminCard } from "../components/cards/admin-card";

export default function Admins() {
  const { auth } = useAuth();
  const { data: admins = [], isLoading, error } = useUsersQuery("admin");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<User | null>(null);

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;

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
              onClick={() => setIsCreateOpen(true)}
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
                  admins.map((admin) => (
                    <AdminCard
                      key={admin._id}
                      admin={admin}
                      isCurrentAdmin={auth?.user._id === admin._id}
                      onEdit={setEditingAdmin}
                      onDelete={setDeletingAdmin}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <AdminFormModal onClose={() => setIsCreateOpen(false)} />
      )}

      {editingAdmin && (
        <AdminFormModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
        />
      )}

      {deletingAdmin && (
        <DeleteAdminModal
          admin={deletingAdmin}
          onClose={() => setDeletingAdmin(null)}
        />
      )}
    </>
  );
}
