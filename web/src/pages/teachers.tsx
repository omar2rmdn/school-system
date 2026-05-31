import { type SubmitEvent, useState } from "react";
import DeleteTeacherModal from "../components/modal/delete-teacher-modal";
import TeacherFormModal from "../components/modal/teacher-form-modal";
import { useClassesQuery } from "../queries/classes";
import { useSubjectsQuery } from "../queries/subjects";
import {
  getQueryErrorMessage,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../queries/users";
import type { TeacherFormValues, TeachingResource, User } from "../types";

const emptyForm: TeacherFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  classes: [],
  subjects: [],
};

function getResourceLabelText(
  values: string[] | undefined,
  resources: TeachingResource[],
) {
  if (!values || values.length === 0) {
    return "None";
  }

  const labelMap = new Map(
    resources.map((resource) => [resource._id, resource.title]),
  );
  return (
    values.map((value) => labelMap.get(value) ?? value).join(", ") || "None"
  );
}

function getResourceIds(
  values: string[] | undefined,
  resources: TeachingResource[],
) {
  if (!values || values.length === 0) {
    return [];
  }

  return values
    .map((value) => {
      const matchById = resources.find((resource) => resource._id === value);
      if (matchById) {
        return matchById._id;
      }

      const matchByTitle = resources.find(
        (resource) => resource.title === value,
      );
      return matchByTitle?._id;
    })
    .filter((value): value is string => Boolean(value));
}

export default function Teachers() {
  const { data: teachers = [], isLoading, error } = useUsersQuery("teacher");
  const { data: classOptions = [], isLoading: isClassesLoading } =
    useClassesQuery();
  const { data: subjectOptions = [], isLoading: isSubjectsLoading } =
    useSubjectsQuery();
  const createTeacherMutation = useCreateUserMutation();
  const updateTeacherMutation = useUpdateUserMutation();
  const deleteTeacherMutation = useDeleteUserMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<User | null>(null);
  const [createValues, setCreateValues] =
    useState<TeacherFormValues>(emptyForm);
  const [editValues, setEditValues] = useState<TeacherFormValues>(emptyForm);

  const isOptionsLoading = isClassesLoading || isSubjectsLoading;
  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createTeacherMutation.error
    ? getQueryErrorMessage(createTeacherMutation.error)
    : undefined;
  const updateErrorMessage = updateTeacherMutation.error
    ? getQueryErrorMessage(updateTeacherMutation.error)
    : undefined;
  const deleteErrorMessage = deleteTeacherMutation.error
    ? getQueryErrorMessage(deleteTeacherMutation.error)
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

    await createTeacherMutation.mutateAsync({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "teacher",
      classes: getResourceIds(createValues.classes, classOptions),
      subjects: getResourceIds(createValues.subjects, subjectOptions),
    });
    setCreateValues(emptyForm);
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingTeacher) {
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

    await updateTeacherMutation.mutateAsync({
      id: editingTeacher._id,
      firstName,
      lastName,
      email,
      phone,
      role: "teacher",
      classes: getResourceIds(editValues.classes, classOptions),
      subjects: getResourceIds(editValues.subjects, subjectOptions),
      ...(password ? { password } : {}),
    });
    setEditValues(emptyForm);
    setEditingTeacher(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingTeacher) {
      return;
    }

    await deleteTeacherMutation.mutateAsync(deletingTeacher._id);
    setDeletingTeacher(null);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Teachers</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {teachers.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">Total teachers</p>
            </div>

            <button
              type="button"
              onClick={() => {
                createTeacherMutation.reset();
                setCreateValues(emptyForm);
                setIsCreateOpen(true);
              }}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Teacher
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Teacher
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Classes
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subjects
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
                      colSpan={6}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : listErrorMessage ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-sm text-red-600">
                      {listErrorMessage}
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {teacher.firstName} {teacher.lastName}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {teacher.email}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {teacher.phone}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {getResourceLabelText(teacher.classes, classOptions)}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {getResourceLabelText(teacher.subjects, subjectOptions)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateTeacherMutation.reset();
                              setEditValues({
                                firstName: teacher.firstName,
                                lastName: teacher.lastName,
                                email: teacher.email,
                                phone: teacher.phone,
                                password: "",
                                classes: getResourceIds(
                                  teacher.classes,
                                  classOptions,
                                ),
                                subjects: getResourceIds(
                                  teacher.subjects,
                                  subjectOptions,
                                ),
                              });
                              setEditingTeacher(teacher);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteTeacherMutation.reset();
                              setDeletingTeacher(teacher);
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
        <TeacherFormModal
          mode="create"
          values={createValues}
          errorMessage={createErrorMessage}
          isSubmitting={createTeacherMutation.isPending}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          isOptionsLoading={isOptionsLoading}
          onValuesChange={setCreateValues}
          onClose={() => {
            createTeacherMutation.reset();
            setCreateValues(emptyForm);
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingTeacher ? (
        <TeacherFormModal
          mode="edit"
          values={editValues}
          errorMessage={updateErrorMessage}
          isSubmitting={updateTeacherMutation.isPending}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          isOptionsLoading={isOptionsLoading}
          onValuesChange={setEditValues}
          onClose={() => {
            updateTeacherMutation.reset();
            setEditValues(emptyForm);
            setEditingTeacher(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingTeacher ? (
        <DeleteTeacherModal
          teacher={deletingTeacher}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteTeacherMutation.isPending}
          onClose={() => {
            deleteTeacherMutation.reset();
            setDeletingTeacher(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
