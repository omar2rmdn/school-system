import { useState } from "react";
import DeleteTeacherModal from "../components/modal/delete-teacher-modal";
import TeacherFormModal from "../components/modal/teacher-form-modal";
import { useClassesQuery } from "../queries/classes";
import { useSubjectsQuery } from "../queries/subjects";
import {
  getQueryErrorMessage,
  useUsersQuery,
} from "../queries/users";
import type { TeachingResource, User } from "../types";
import { TeacherCard } from "../components/cards/teacher-card";

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

export default function Teachers() {
  const { data: teachers = [], isLoading, error } = useUsersQuery("teacher");
  const { data: classOptions = [], isLoading: isClassesLoading } =
    useClassesQuery();
  const { data: subjectOptions = [], isLoading: isSubjectsLoading } =
    useSubjectsQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<User | null>(null);

  const isOptionsLoading = isClassesLoading || isSubjectsLoading;
  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;

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
              onClick={() => setIsCreateOpen(true)}
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
                    <TeacherCard
                      key={teacher._id}
                      teacher={teacher}
                      classesLabel={getResourceLabelText(teacher.classes, classOptions)}
                      subjectsLabel={getResourceLabelText(teacher.subjects, subjectOptions)}
                      onEdit={setEditingTeacher}
                      onDelete={setDeletingTeacher}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen ? (
        <TeacherFormModal
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          isOptionsLoading={isOptionsLoading}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editingTeacher ? (
        <TeacherFormModal
          teacher={editingTeacher}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          isOptionsLoading={isOptionsLoading}
          onClose={() => setEditingTeacher(null)}
        />
      ) : null}

      {deletingTeacher ? (
        <DeleteTeacherModal
          teacher={deletingTeacher}
          onClose={() => setDeletingTeacher(null)}
        />
      ) : null}
    </>
  );
}
