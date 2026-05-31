import { type SubmitEvent, useState } from "react";
import DeleteStudentModal from "../components/modal/delete-student-modal";
import StudentFormModal, {
  defaultStudentFormValues,
} from "../components/modal/student-form-modal";
import { useClassesQuery } from "../queries/classes";
import {
  useCreateStudentMutation,
  useDeleteStudentMutation,
  useStudentsQuery,
  useUpdateStudentMutation,
} from "../queries/students";
import { getQueryErrorMessage } from "../queries/users";
import type { ClassResource, Student, StudentFormValues } from "../types";

const columns = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "class", label: "Class" },
  { key: "parentPhone", label: "Parent Phone" },
  { key: "actions", label: "Actions" },
];

function getStudentClassName(student: {
  class?: string | ClassResource;
  className?: string;
}) {
  if (student.class && typeof student.class === "object") {
    return student.class.title;
  }

  return student.class || student.className || "-";
}

function getStudentClassId(student: { class?: string | ClassResource }) {
  if (!student.class) {
    return "";
  }

  return typeof student.class === "object" ? student.class._id : student.class;
}

function getParentPhone(student: { parentPhone?: string; phone?: string }) {
  return student.parentPhone || student.phone || "-";
}

export default function Students() {
  const { data = [], isLoading, error } = useStudentsQuery();
  const { data: classes = [], isLoading: isClassesLoading } = useClassesQuery();
  const createStudentMutation = useCreateStudentMutation();
  const updateStudentMutation = useUpdateStudentMutation();
  const deleteStudentMutation = useDeleteStudentMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [createValues, setCreateValues] = useState<StudentFormValues>(
    defaultStudentFormValues,
  );
  const [editValues, setEditValues] = useState<StudentFormValues>(
    defaultStudentFormValues,
  );

  const classOptions = classes.map((item) => ({
    id: item._id,
    title: item.title,
  }));
  const classLabelMap = new Map(
    classOptions.map((item) => [item.id, item.title]),
  );
  const isOptionsLoading = isClassesLoading;

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createStudentMutation.error
    ? getQueryErrorMessage(createStudentMutation.error)
    : undefined;
  const updateErrorMessage = updateStudentMutation.error
    ? getQueryErrorMessage(updateStudentMutation.error)
    : undefined;
  const deleteErrorMessage = deleteStudentMutation.error
    ? getQueryErrorMessage(deleteStudentMutation.error)
    : undefined;

  function updateFormValues(
    mode: "create" | "edit",
    key: keyof StudentFormValues,
    value: StudentFormValues[keyof StudentFormValues],
  ) {
    const setter = mode === "create" ? setCreateValues : setEditValues;
    setter((current) => ({ ...current, [key]: value }));
  }

  function getInitialFormValues(student?: Student): StudentFormValues {
    if (!student) {
      return defaultStudentFormValues;
    }

    return {
      firstName: student.firstName,
      lastName: student.lastName,
      class: getStudentClassId(student),
      parentPhone:
        getParentPhone(student) === "-" ? "" : getParentPhone(student),
    };
  }

  function getPayload(values: StudentFormValues) {
    return {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      class: values.class,
      parentPhone: values.parentPhone.trim(),
    };
  }

  async function handleCreateSubmit(event: SubmitEvent) {
    event.preventDefault();

    const payload = getPayload(createValues);
    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.class ||
      !payload.parentPhone
    ) {
      return;
    }

    await createStudentMutation.mutateAsync(payload);
    setCreateValues(defaultStudentFormValues);
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingStudent) {
      return;
    }

    const payload = getPayload(editValues);
    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.class ||
      !payload.parentPhone
    ) {
      return;
    }

    await updateStudentMutation.mutateAsync({
      id: editingStudent._id,
      ...payload,
    });
    setEditValues(defaultStudentFormValues);
    setEditingStudent(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingStudent) {
      return;
    }

    await deleteStudentMutation.mutateAsync(deletingStudent._id);
    setDeletingStudent(null);
  }

  function openCreateModal() {
    createStudentMutation.reset();
    setCreateValues(defaultStudentFormValues);
    setIsCreateOpen(true);
  }

  function openEditModal(student: Student) {
    updateStudentMutation.reset();
    setEditValues(getInitialFormValues(student));
    setEditingStudent(student);
  }

  function openDeleteModal(student: Student) {
    deleteStudentMutation.reset();
    setDeletingStudent(student);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Students</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {data.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">Total students</p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Student
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
                      No students found.
                    </td>
                  </tr>
                ) : (
                  data.map((student) => (
                    <tr key={student._id}>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {student.firstName}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {student.lastName}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {classLabelMap.get(getStudentClassId(student)) ??
                          getStudentClassName(student)}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {getParentPhone(student)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(student)}
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
        <StudentFormModal
          mode="create"
          values={createValues}
          classOptions={classOptions}
          errorMessage={createErrorMessage}
          isSubmitting={createStudentMutation.isPending}
          isOptionsLoading={isOptionsLoading}
          onChange={(key, value) => updateFormValues("create", key, value)}
          onClose={() => {
            createStudentMutation.reset();
            setCreateValues(defaultStudentFormValues);
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingStudent ? (
        <StudentFormModal
          mode="edit"
          values={editValues}
          classOptions={classOptions}
          errorMessage={updateErrorMessage}
          isSubmitting={updateStudentMutation.isPending}
          isOptionsLoading={isOptionsLoading}
          onChange={(key, value) => updateFormValues("edit", key, value)}
          onClose={() => {
            updateStudentMutation.reset();
            setEditValues(defaultStudentFormValues);
            setEditingStudent(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingStudent ? (
        <DeleteStudentModal
          student={deletingStudent}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteStudentMutation.isPending}
          onClose={() => {
            deleteStudentMutation.reset();
            setDeletingStudent(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
