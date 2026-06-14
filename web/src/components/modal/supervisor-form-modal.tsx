import { useState, type FormEvent } from "react";
import type { SupervisorFormValues } from "../../types";

export type Props = {
  mode: "create" | "edit";
  initialValues: SupervisorFormValues;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: SupervisorFormValues) => void;
};

const emptySupervisorFormValues: SupervisorFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

export default function SupervisorFormModal({
  mode,
  initialValues,
  errorMessage,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<SupervisorFormValues>(initialValues);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {mode === "create" ? "Add Supervisor" : "Edit Supervisor"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the supervisor details.
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
                htmlFor={`supervisor-${mode}-first-name`}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First Name
              </label>
              <input
                id={`supervisor-${mode}-first-name`}
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
                htmlFor={`supervisor-${mode}-last-name`}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last Name
              </label>
              <input
                id={`supervisor-${mode}-last-name`}
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
                htmlFor={`supervisor-${mode}-email`}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id={`supervisor-${mode}-email`}
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
                htmlFor={`supervisor-${mode}-phone`}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>
              <input
                id={`supervisor-${mode}-phone`}
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
              htmlFor={`supervisor-${mode}-password`}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id={`supervisor-${mode}-password`}
              type="password"
              value={values.password}
              onChange={(event) =>
                setValues({ ...values, password: event.target.value })
              }
              placeholder={
                mode === "create"
                  ? "Password"
                  : "Leave blank to keep current password"
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

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
              disabled={isSubmitting}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { emptySupervisorFormValues };
