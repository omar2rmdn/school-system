import type { ClassResource } from "../../types";
import { useDeleteClassMutation } from "../../queries/classes";
import { getQueryErrorMessage } from "../../queries/users";

export type Props = {
  resource: ClassResource;
  onClose: () => void;
};

export default function DeleteClassModal({
  resource,
  onClose,
}: Props) {
  const deleteMutation = useDeleteClassMutation();
  const isSubmitting = deleteMutation.isPending;
  const errorMessage = deleteMutation.error ? getQueryErrorMessage(deleteMutation.error) : undefined;

  async function handleConfirm() {
    await deleteMutation.mutateAsync(resource._id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-950">Delete Class</h2>
        <p className="mt-2 text-sm text-slate-600">
          Delete{" "}
          <span className="font-semibold text-slate-900">{resource.title}</span>
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
            onClick={handleConfirm}
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
