import { useState } from "react";
import DeleteStudentModal from "../components/modal/delete-student-modal";
import StudentFormModal from "../components/modal/student-form-modal";
import { useClassesQuery } from "../queries/classes";
import { useStudentsQuery } from "../queries/students";
import { getQueryErrorMessage } from "../queries/users";
import type { ClassResource, Student } from "../types";
import { StudentCard } from "../components/cards/student-card";

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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const classOptions = classes.map((item) => ({
    id: item._id,
    title: item.title,
  }));
  const classLabelMap = new Map(
    classOptions.map((item) => [item.id, item.title]),
  );
  const isOptionsLoading = isClassesLoading;

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;

  function openCreateModal() {
    setIsCreateOpen(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);
  }

  function openDeleteModal(student: Student) {
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
                    <StudentCard
                      key={student._id}
                      student={student}
                      classNameLabel={
                        classLabelMap.get(getStudentClassId(student)) ??
                        getStudentClassName(student)
                      }
                      parentPhone={getParentPhone(student)}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <StudentFormModal
          classOptions={classOptions}
          isOptionsLoading={isOptionsLoading}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {editingStudent && (
        <StudentFormModal
          student={editingStudent}
          classOptions={classOptions}
          isOptionsLoading={isOptionsLoading}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {deletingStudent && (
        <DeleteStudentModal
          student={deletingStudent}
          onClose={() => setDeletingStudent(null)}
        />
      )}
    </>
  );
}
