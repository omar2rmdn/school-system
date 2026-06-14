import { useState, type FormEvent } from "react";
import type { StudentFormValues, Student, ClassResource } from "../../types";
import { useCreateStudentMutation, useUpdateStudentMutation } from "../../queries/students";
import { getQueryErrorMessage } from "../../queries/users";

export type Props = {
  student?: Student;
  classOptions: { id: string; title: string }[];
  isOptionsLoading: boolean;
  onClose: () => void;
};

const defaultStudentFormValues: StudentFormValues = {
  firstName: "",
  lastName: "",
  class: "",
  parentPhone: "",
};

function getStudentClassId(student: { class?: string | ClassResource }) {
  if (!student.class) {
    return "";
  }
  return typeof student.class === "object" ? student.class._id : student.class;
}

function getParentPhone(student: { parentPhone?: string; phone?: string }) {
  return student.parentPhone || student.phone || "-";
}

function getInitialFormValues(student?: Student): StudentFormValues {
  if (!student) {
    return defaultStudentFormValues;
  }
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    class: getStudentClassId(student),
    parentPhone: getParentPhone(student) === "-" ? "" : getParentPhone(student),
  };
}

export default function StudentFormModal({
  student,
  classOptions,
  isOptionsLoading,
  onClose,
}: Props) {
  const [values, setValues] = useState<StudentFormValues>(getInitialFormValues(student));

  const createMutation = useCreateStudentMutation();
  const updateMutation = useUpdateStudentMutation();

  const isEditing = !!student;
  const isSubmitting = isEditing ? updateMutation.isPending : createMutation.isPending;
  const error = isEditing ? updateMutation.error : createMutation.error;
  const errorMessage = error ? getQueryErrorMessage(error) : undefined;

  const heading = isEditing ? "Edit Student" : "Add Student";
  const submitLabel = isEditing ? "Save Changes" : "Create";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      class: values.class,
      parentPhone: values.parentPhone.trim(),
    };

    if (!payload.firstName || !payload.lastName || !payload.class || !payload.parentPhone) {
      return;
    }

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: student._id,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{heading}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the student details.
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="student-first-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First Name
              </label>
              <input
                id="student-first-name"
                value={values.firstName}
                onChange={(event) =>
                  setValues({ ...values, firstName: event.target.value })
                }
                placeholder="First name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="student-last-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last Name
              </label>
              <input
                id="student-last-name"
                value={values.lastName}
                onChange={(event) =>
                  setValues({ ...values, lastName: event.target.value })
                }
                placeholder="Last name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="student-class"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Class
              </label>
              <select
                id="student-class"
                value={values.class}
                onChange={(event) =>
                  setValues({ ...values, class: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="">Select a class</option>
                {classOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="student-parent-phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Parent Phone
              </label>
              <input
                id="student-parent-phone"
                value={values.parentPhone}
                onChange={(event) =>
                  setValues({ ...values, parentPhone: event.target.value })
                }
                placeholder="Parent phone"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            {isOptionsLoading
              ? "Loading classes..."
              : "Parents are linked to students by parent phone."}
          </p>

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
              disabled={isSubmitting || isOptionsLoading}
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

export { defaultStudentFormValues };
