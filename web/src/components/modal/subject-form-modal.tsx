import { useState, type FormEvent } from "react";
import type { SubjectResource } from "../../types";
import { useCreateSubjectMutation, useUpdateSubjectMutation } from "../../queries/subjects";
import { getQueryErrorMessage } from "../../queries/users";

export type Props = {
  resource?: SubjectResource;
  onClose: () => void;
};

export default function SubjectFormModal({
  resource,
  onClose,
}: Props) {
  const [title, setTitle] = useState(resource?.title || "");

  const createMutation = useCreateSubjectMutation();
  const updateMutation = useUpdateSubjectMutation();

  const isEditing = !!resource;
  const isSubmitting = isEditing ? updateMutation.isPending : createMutation.isPending;
  const error = isEditing ? updateMutation.error : createMutation.error;
  const errorMessage = error ? getQueryErrorMessage(error) : undefined;

  const heading = isEditing ? "Edit Subject" : "Add Subject";
  const submitLabel = isEditing ? "Save Changes" : "Create";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (isEditing) {
      await updateMutation.mutateAsync({ id: resource._id, title: trimmedTitle });
    } else {
      await createMutation.mutateAsync({ title: trimmedTitle });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{heading}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the subject title.
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
          <div>
            <label
              htmlFor="subject-title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Title
            </label>
            <input
              id="subject-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Subject title"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              autoFocus
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
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
