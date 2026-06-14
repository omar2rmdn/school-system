import { useState, type FormEvent } from "react";
import type {
  TeacherFormValues,
  ClassResource,
  SubjectResource,
  TeachingResource,
  User,
} from "../../types";
import { useCreateUserMutation, useUpdateUserMutation, getQueryErrorMessage } from "../../queries/users";

export type Props = {
  teacher?: User;
  classOptions: ClassResource[];
  subjectOptions: SubjectResource[];
  isOptionsLoading: boolean;
  onClose: () => void;
};

const emptyTeacherFormValues: TeacherFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  classes: [],
  subjects: [],
};

function toggleSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
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

export default function TeacherFormModal({
  teacher,
  classOptions,
  subjectOptions,
  isOptionsLoading,
  onClose,
}: Props) {
  const [values, setValues] = useState<TeacherFormValues>(() => {
    if (teacher) {
      return {
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone || "",
        password: "",
        classes: getResourceIds(teacher.classes, classOptions),
        subjects: getResourceIds(teacher.subjects, subjectOptions),
      };
    }
    return emptyTeacherFormValues;
  });

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const isEditing = !!teacher;
  const isSubmitting = isEditing ? updateMutation.isPending : createMutation.isPending;
  const error = isEditing ? updateMutation.error : createMutation.error;
  const errorMessage = error ? getQueryErrorMessage(error) : undefined;

  const heading = isEditing ? "Edit Teacher" : "Add Teacher";
  const submitLabel = isEditing ? "Save Changes" : "Create";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const password = values.password.trim();

    if (isEditing) {
      if (!firstName || !lastName || !email || !phone) return;
      await updateMutation.mutateAsync({
        id: teacher._id,
        firstName,
        lastName,
        email,
        phone,
        role: "teacher",
        classes: getResourceIds(values.classes, classOptions),
        subjects: getResourceIds(values.subjects, subjectOptions),
        ...(password ? { password } : {}),
      });
    } else {
      if (!firstName || !lastName || !email || !phone || !password) return;
      await createMutation.mutateAsync({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: "teacher",
        classes: getResourceIds(values.classes, classOptions),
        subjects: getResourceIds(values.subjects, subjectOptions),
      });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {heading}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the teacher details.
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
                htmlFor="teacher-first-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First Name
              </label>
              <input
                id="teacher-first-name"
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
                htmlFor="teacher-last-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last Name
              </label>
              <input
                id="teacher-last-name"
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
                htmlFor="teacher-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="teacher-email"
                type="email"
                value={values.email}
                onChange={(event) =>
                  setValues({ ...values, email: event.target.value })
                }
                placeholder="Email address"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="teacher-phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>
              <input
                id="teacher-phone"
                value={values.phone}
                onChange={(event) =>
                  setValues({ ...values, phone: event.target.value })
                }
                placeholder="Phone number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="teacher-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="teacher-password"
              type="password"
              value={values.password}
              onChange={(event) =>
                setValues({ ...values, password: event.target.value })
              }
              placeholder={
                !isEditing
                  ? "Password"
                  : "Leave blank to keep current password"
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

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
                        setValues({
                          ...values,
                          classes: toggleSelection(values.classes, option._id),
                        })
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
                        setValues({
                          ...values,
                          subjects: toggleSelection(
                            values.subjects,
                            option._id,
                          ),
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
                    />
                    <span>{option.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            {isOptionsLoading
              ? "Loading class and subject options..."
              : "Select one or more classes and subjects."}
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

export { emptyTeacherFormValues };
