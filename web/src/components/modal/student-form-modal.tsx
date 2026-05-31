import type { StudentFormModalProps, StudentFormValues } from "../../types";

const defaultStudentFormValues: StudentFormValues = {
  firstName: "",
  lastName: "",
  class: "",
  parentPhone: "",
};

export default function StudentFormModal({
  mode,
  values,
  classOptions,
  errorMessage,
  isSubmitting,
  isOptionsLoading,
  onChange,
  onClose,
  onSubmit,
}: StudentFormModalProps) {
  const heading = mode === "create" ? "Add Student" : "Edit Student";
  const submitLabel = mode === "create" ? "Create" : "Save Changes";

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

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
                onChange={(event) => onChange("firstName", event.target.value)}
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
                onChange={(event) => onChange("lastName", event.target.value)}
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
                onChange={(event) => onChange("class", event.target.value)}
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
                onChange={(event) => onChange("parentPhone", event.target.value)}
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
