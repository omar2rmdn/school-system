import { type FormEvent, useMemo, useState } from "react";
import { useClassesQuery } from "../queries/classes";
import { useSubjectsQuery } from "../queries/subjects";
import {
  getQueryErrorMessage,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../queries/users";
import { useAuth } from "../store/auth/context";
import type { TitledResource, User, UserRole } from "../types";

type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  classes: string[];
  subjects: string[];
};

type UserManagementPageProps = {
  role: UserRole;
  title: string;
  totalLabel: string;
  emptyMessage: string;
  includeRoleColumn?: boolean;
  includeTeacherColumns?: boolean;
};

type UserFormModalProps = {
  mode: "create" | "edit";
  role: UserRole;
  values: UserFormValues;
  errorMessage?: string;
  isSubmitting: boolean;
  includeTeacherFields: boolean;
  classOptions: TitledResource[];
  subjectOptions: TitledResource[];
  isOptionsLoading: boolean;
  onChange: <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type DeleteUserModalProps = {
  role: UserRole;
  user: User;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const defaultFormValues: UserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  classes: [],
  subjects: [],
};

function titleCaseRole(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function joinList(values?: string[]) {
  return values && values.length > 0 ? values.join(", ") : "None";
}

function getResourceLabelMap(resources: TitledResource[]) {
  return new Map(resources.map((resource) => [resource._id, resource.title]));
}

function toResourceLabels(values: string[] | undefined, resources: TitledResource[]) {
  if (!values || values.length === 0) {
    return [];
  }

  const labelMap = getResourceLabelMap(resources);
  return values.map((value) => labelMap.get(value) ?? value);
}

function normalizeResourceIds(values: string[] | undefined, resources: TitledResource[]) {
  if (!values || values.length === 0) {
    return [];
  }

  return values
    .map((value) => {
      const matchById = resources.find((resource) => resource._id === value);
      if (matchById) {
        return matchById._id;
      }

      const matchByTitle = resources.find((resource) => resource.title === value);
      return matchByTitle?._id;
    })
    .filter((value): value is string => Boolean(value));
}

function toggleSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function UserFormModal({
  mode,
  role,
  values,
  errorMessage,
  isSubmitting,
  includeTeacherFields,
  classOptions,
  subjectOptions,
  isOptionsLoading,
  onChange,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const roleLabel = titleCaseRole(role);
  const heading = mode === "create" ? `Add ${roleLabel}` : `Edit ${roleLabel}`;
  const submitLabel = mode === "create" ? "Create" : "Save Changes";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{heading}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the {roleLabel.toLowerCase()} details.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${role}-first-name`}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First Name
              </label>
              <input
                id={`${role}-first-name`}
                value={values.firstName}
                onChange={(event) => onChange("firstName", event.target.value)}
                placeholder="First name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor={`${role}-last-name`}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last Name
              </label>
              <input
                id={`${role}-last-name`}
                value={values.lastName}
                onChange={(event) => onChange("lastName", event.target.value)}
                placeholder="Last name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor={`${role}-email`}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id={`${role}-email`}
                type="email"
                value={values.email}
                onChange={(event) => onChange("email", event.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor={`${role}-phone`}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>
              <input
                id={`${role}-phone`}
                value={values.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                placeholder="Phone number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${role}-password`}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id={`${role}-password`}
              type="password"
              value={values.password}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder={mode === "create" ? "Password" : "Leave blank to keep current password"}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

          {includeTeacherFields ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 block text-sm font-medium text-slate-700">
                  Classes
                </p>
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                  {classOptions.map((option) => (
                    <label
                      key={option._id}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={values.classes.includes(option._id)}
                        onChange={() =>
                          onChange("classes", toggleSelection(values.classes, option._id))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
                      />
                      <span>{option.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 block text-sm font-medium text-slate-700">
                  Subjects
                </p>
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                  {subjectOptions.map((option) => (
                    <label
                      key={option._id}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={values.subjects.includes(option._id)}
                        onChange={() =>
                          onChange("subjects", toggleSelection(values.subjects, option._id))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
                      />
                      <span>{option.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {includeTeacherFields ? (
            <p className="text-sm text-slate-500">
              {isOptionsLoading
                ? "Loading class and subject options..."
                : "Select one or more classes and subjects."}
            </p>
          ) : null}

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
              disabled={isSubmitting || (includeTeacherFields && isOptionsLoading)}
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

function DeleteUserModal({
  role,
  user,
  errorMessage,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  const roleLabel = titleCaseRole(role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-950">{`Delete ${roleLabel}`}</h2>
        <p className="mt-2 text-sm text-slate-600">
          Delete{" "}
          <span className="font-semibold text-slate-900">
            {user.firstName} {user.lastName}
          </span>
          ? This action cannot be undone.
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

function getInitialFormValues(user?: User): UserFormValues {
  if (!user) {
    return defaultFormValues;
  }

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    password: "",
    classes: user.classes ?? [],
    subjects: user.subjects ?? [],
  };
}

export default function UserManagementPage({
  role,
  title,
  totalLabel,
  emptyMessage,
  includeRoleColumn = true,
  includeTeacherColumns = false,
}: UserManagementPageProps) {
  const { auth } = useAuth();
  const { data = [], isLoading, error } = useUsersQuery(role);
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const {
    data: classes = [],
    isLoading: isClassesLoading,
  } = useClassesQuery();
  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
  } = useSubjectsQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [createValues, setCreateValues] = useState<UserFormValues>(defaultFormValues);
  const [editValues, setEditValues] = useState<UserFormValues>(defaultFormValues);

  const columns = useMemo(() => {
    const baseColumns = [
      { key: "name", label: titleCaseRole(role) },
      ...(includeRoleColumn ? [{ key: "role", label: "Role" }] : []),
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      ...(includeTeacherColumns
        ? [
            { key: "classes", label: "Classes" },
            { key: "subjects", label: "Subjects" },
          ]
        : []),
      { key: "actions", label: "Actions" },
    ];

    return baseColumns;
  }, [includeRoleColumn, includeTeacherColumns, role]);

  const isOptionsLoading = includeTeacherColumns && (isClassesLoading || isSubjectsLoading);

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createUserMutation.error
    ? getQueryErrorMessage(createUserMutation.error)
    : undefined;
  const updateErrorMessage = updateUserMutation.error
    ? getQueryErrorMessage(updateUserMutation.error)
    : undefined;
  const deleteErrorMessage = deleteUserMutation.error
    ? getQueryErrorMessage(deleteUserMutation.error)
    : undefined;

  function isCurrentUser(user: User) {
    return auth?.user._id === user._id;
  }

  function updateFormValues(
    mode: "create" | "edit",
    key: keyof UserFormValues,
    value: UserFormValues[keyof UserFormValues],
  ) {
    const setter = mode === "create" ? setCreateValues : setEditValues;
    setter((current) => ({ ...current, [key]: value }));
  }

  function getPayload(values: UserFormValues) {
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      role,
      ...(values.password.trim() ? { password: values.password.trim() } : {}),
      ...(includeTeacherColumns
        ? {
            classes: normalizeResourceIds(values.classes, classes),
            subjects: normalizeResourceIds(values.subjects, subjects),
          }
        : {}),
    };

    return payload;
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = getPayload(createValues);
    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.phone ||
      !("password" in payload)
    ) {
      return;
    }

    await createUserMutation.mutateAsync(payload);
    setCreateValues(defaultFormValues);
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    const payload = getPayload(editValues);
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone) {
      return;
    }

    await updateUserMutation.mutateAsync({ id: editingUser._id, ...payload });
    setEditValues(defaultFormValues);
    setEditingUser(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingUser) {
      return;
    }

    await deleteUserMutation.mutateAsync(deletingUser._id);
    setDeletingUser(null);
  }

  function openCreateModal() {
    createUserMutation.reset();
    setCreateValues(defaultFormValues);
    setIsCreateOpen(true);
  }

  function openEditModal(user: User) {
    updateUserMutation.reset();
    setEditValues({
      ...getInitialFormValues(user),
      classes: normalizeResourceIds(user.classes, classes),
      subjects: normalizeResourceIds(user.subjects, subjects),
    });
    setEditingUser(user);
  }

  function openDeleteModal(user: User) {
    if (role === "admin" && isCurrentUser(user)) {
      return;
    }

    deleteUserMutation.reset();
    setDeletingUser(user);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">{title}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {data.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">{totalLabel}</p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              {`Add ${titleCaseRole(role)}`}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                        column.key === "actions" ? "text-right" : "text-left"
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : listErrorMessage ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-6 text-sm text-red-600"
                    >
                      {listErrorMessage}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((user) => (
                    <tr key={user._id}>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                          {role === "admin" && isCurrentUser(user) ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              Me
                            </span>
                          ) : null}
                        </div>
                      </td>
                      {includeRoleColumn ? (
                        <td className="px-3 py-3 text-sm text-slate-700">
                          {user.role}
                        </td>
                      ) : null}
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {user.email}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {user.phone}
                      </td>
                      {includeTeacherColumns ? (
                        <>
                          <td className="px-3 py-3 text-sm text-slate-700">
                            {joinList(toResourceLabels(user.classes, classes))}
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-700">
                            {joinList(toResourceLabels(user.subjects, subjects))}
                          </td>
                        </>
                      ) : null}
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          {role === "admin" && isCurrentUser(user) ? null : (
                            <button
                              type="button"
                              onClick={() => openDeleteModal(user)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
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
        <UserFormModal
          mode="create"
          role={role}
          values={createValues}
          errorMessage={createErrorMessage}
          isSubmitting={createUserMutation.isPending}
          includeTeacherFields={includeTeacherColumns}
          classOptions={classes}
          subjectOptions={subjects}
          isOptionsLoading={isOptionsLoading}
          onChange={(key, value) => updateFormValues("create", key, value)}
          onClose={() => {
            createUserMutation.reset();
            setCreateValues(defaultFormValues);
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingUser ? (
        <UserFormModal
          mode="edit"
          role={role}
          values={editValues}
          errorMessage={updateErrorMessage}
          isSubmitting={updateUserMutation.isPending}
          includeTeacherFields={includeTeacherColumns}
          classOptions={classes}
          subjectOptions={subjects}
          isOptionsLoading={isOptionsLoading}
          onChange={(key, value) => updateFormValues("edit", key, value)}
          onClose={() => {
            updateUserMutation.reset();
            setEditValues(defaultFormValues);
            setEditingUser(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingUser ? (
        <DeleteUserModal
          role={role}
          user={deletingUser}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteUserMutation.isPending}
          onClose={() => {
            deleteUserMutation.reset();
            setDeletingUser(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
