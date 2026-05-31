import { type SubmitEvent, useState } from "react";
import DeleteTimetableModal from "../components/modal/delete-timetable-modal";
import TimetableDetailsModal from "../components/modal/timetable-details-modal";
import TimetableFormModal from "../components/modal/timetable-form-modal";
import {
  getRelatedId,
  getRelatedTitle,
} from "../components/timetables/helpers";
import { useClassesQuery } from "../queries/classes";
import { useSubjectsQuery } from "../queries/subjects";
import {
  useCreateTimetableMutation,
  useDeleteTimetableMutation,
  useTimetablesQuery,
  useUpdateTimetableMutation,
} from "../queries/timetables";
import { getQueryErrorMessage } from "../queries/users";
import type { TimetableFormValues, TimetableResource } from "../types";

const defaultValue: TimetableFormValues = {
  class: "",
  days: [{ day: "Sunday", startTime: "", endTime: "", subject: "" }],
};

export default function Timetables() {
  const { data = [], isLoading, error } = useTimetablesQuery();
  const { data: classes = [], isLoading: isClassesLoading } = useClassesQuery();
  const { data: subjects = [], isLoading: isSubjectsLoading } =
    useSubjectsQuery();
  const createTimetableMutation = useCreateTimetableMutation();
  const updateTimetableMutation = useUpdateTimetableMutation();
  const deleteTimetableMutation = useDeleteTimetableMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingTimetable, setViewingTimetable] =
    useState<TimetableResource | null>(null);
  const [editingTimetable, setEditingTimetable] =
    useState<TimetableResource | null>(null);
  const [deletingTimetable, setDeletingTimetable] =
    useState<TimetableResource | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [createValues, setCreateValues] =
    useState<TimetableFormValues>(defaultValue);
  const [editValues, setEditValues] =
    useState<TimetableFormValues>(defaultValue);

  const classOptions = classes.map((item) => ({
    id: item._id,
    title: item.title,
  }));
  const subjectOptions = subjects.map((item) => ({
    id: item._id,
    title: item.title,
  }));
  const classLabelMap = new Map(
    classOptions.map((item) => [item.id, item.title]),
  );
  const subjectLabelMap = new Map(
    subjectOptions.map((item) => [item.id, item.title]),
  );
  const isOptionsLoading = isClassesLoading || isSubjectsLoading;
  const filteredTimetables = selectedClassId
    ? data.filter((item) => getRelatedId(item.class) === selectedClassId)
    : data;

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createTimetableMutation.error
    ? getQueryErrorMessage(createTimetableMutation.error)
    : undefined;
  const updateErrorMessage = updateTimetableMutation.error
    ? getQueryErrorMessage(updateTimetableMutation.error)
    : undefined;
  const deleteErrorMessage = deleteTimetableMutation.error
    ? getQueryErrorMessage(deleteTimetableMutation.error)
    : undefined;

  function updateFormValues(
    mode: "create" | "edit",
    key: keyof TimetableFormValues,
    value: TimetableFormValues[keyof TimetableFormValues],
  ) {
    const setter = mode === "create" ? setCreateValues : setEditValues;
    setter((current) => ({ ...current, [key]: value }));
  }

  function getInitialFormValues(
    timetable?: TimetableResource,
  ): TimetableFormValues {
    if (!timetable) {
      return defaultValue;
    }

    return {
      class: getRelatedId(timetable.class),
      days: timetable.days.map((slot) => ({
        day: slot.day,
        subject: getRelatedId(slot.subject),
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    };
  }

  async function handleCreateSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (
      !createValues.class ||
      createValues.days.some((d) => !d.subject || !d.startTime || !d.endTime)
    ) {
      return;
    }

    await createTimetableMutation.mutateAsync({
      class: createValues.class,
      days: createValues.days.map((slot) => ({
        day: slot.day,
        subject: slot.subject,
        startTime: slot.startTime.trim(),
        endTime: slot.endTime.trim(),
      })),
    });

    setCreateValues(defaultValue);
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingTimetable) {
      return;
    }

    if (
      !editValues.class ||
      editValues.days.some((d) => !d.subject || !d.startTime || !d.endTime)
    ) {
      return;
    }

    await updateTimetableMutation.mutateAsync({
      id: editingTimetable._id,
      class: editValues.class,
      days: editValues.days.map((slot) => ({
        day: slot.day,
        subject: slot.subject,
        startTime: slot.startTime.trim(),
        endTime: slot.endTime.trim(),
      })),
    });
    setEditValues(defaultValue);
    setEditingTimetable(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingTimetable) {
      return;
    }

    await deleteTimetableMutation.mutateAsync(deletingTimetable._id);
    setDeletingTimetable(null);
  }

  function openCreateModal() {
    createTimetableMutation.reset();
    setCreateValues(defaultValue);
    setIsCreateOpen(true);
  }

  function openEditModal(timetable: TimetableResource) {
    updateTimetableMutation.reset();
    setEditValues(getInitialFormValues(timetable));
    setViewingTimetable(null);
    setEditingTimetable(timetable);
  }

  function openDeleteModal(timetable: TimetableResource) {
    deleteTimetableMutation.reset();
    setViewingTimetable(null);
    setDeletingTimetable(timetable);
  }

  function openViewModal(timetable: TimetableResource) {
    setViewingTimetable(timetable);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Timetables</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {data.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Total timetable entries
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Timetable
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <label
                htmlFor="timetables-class-filter"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Filter by class
              </label>
              <select
                id="timetables-class-filter"
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="">All classes</option>
                {classOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-slate-500">
              Showing {filteredTimetables.length} of {data.length} entries
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Class
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
                      colSpan={2}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : listErrorMessage ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-sm text-red-600">
                      {listErrorMessage}
                    </td>
                  </tr>
                ) : filteredTimetables.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      {selectedClassId
                        ? "No timetable entries found for the selected class."
                        : "No timetable entries found."}
                    </td>
                  </tr>
                ) : (
                  filteredTimetables.map((timetable) => (
                    <tr key={timetable._id}>
                      <td className="px-3 py-4 text-sm font-medium text-slate-900">
                        {getRelatedTitle(timetable.class, classLabelMap)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openViewModal(timetable)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            View
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
        <TimetableFormModal
          mode="create"
          values={createValues}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          errorMessage={createErrorMessage}
          isSubmitting={createTimetableMutation.isPending}
          isOptionsLoading={isOptionsLoading}
          onChange={(key, value) => updateFormValues("create", key, value)}
          onClose={() => {
            createTimetableMutation.reset();
            setCreateValues(defaultValue);
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingTimetable ? (
        <TimetableFormModal
          mode="edit"
          values={editValues}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          errorMessage={updateErrorMessage}
          isSubmitting={updateTimetableMutation.isPending}
          isOptionsLoading={isOptionsLoading}
          onChange={(key, value) => updateFormValues("edit", key, value)}
          onClose={() => {
            updateTimetableMutation.reset();
            setEditValues(defaultValue);
            setEditingTimetable(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {viewingTimetable ? (
        <TimetableDetailsModal
          timetable={viewingTimetable}
          classTitle={getRelatedTitle(viewingTimetable.class, classLabelMap)}
          subjectLabelMap={subjectLabelMap}
          onClose={() => setViewingTimetable(null)}
          onEdit={() => openEditModal(viewingTimetable)}
          onDelete={() => openDeleteModal(viewingTimetable)}
        />
      ) : null}

      {deletingTimetable ? (
        <DeleteTimetableModal
          classTitle={getRelatedTitle(deletingTimetable.class, classLabelMap)}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteTimetableMutation.isPending}
          onClose={() => {
            deleteTimetableMutation.reset();
            setDeletingTimetable(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
