import { useState } from "react";
import DeleteTimetableModal from "../components/modal/delete-timetable-modal";
import TimetableDetailsModal from "../components/modal/timetable-details-modal";
import TimetableFormModal from "../components/modal/timetable-form-modal";
import { getRelatedId, getRelatedTitle } from "../utils/helpers";
import { useClassesQuery } from "../queries/classes";
import { useSubjectsQuery } from "../queries/subjects";
import { useTimetablesQuery } from "../queries/timetables";
import { getQueryErrorMessage } from "../queries/users";
import type { TimetableResource } from "../types";
import { TimetableCard } from "../components/cards/timetable-card";

export default function Timetables() {
  const { data = [], isLoading, error } = useTimetablesQuery();
  const { data: classes = [], isLoading: isClassesLoading } = useClassesQuery();
  const { data: subjects = [], isLoading: isSubjectsLoading } =
    useSubjectsQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingTimetable, setViewingTimetable] =
    useState<TimetableResource | null>(null);
  const [editingTimetable, setEditingTimetable] =
    useState<TimetableResource | null>(null);
  const [deletingTimetable, setDeletingTimetable] =
    useState<TimetableResource | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");

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

  function openCreateModal() {
    setIsCreateOpen(true);
  }

  function openEditModal(timetable: TimetableResource) {
    setViewingTimetable(null);
    setEditingTimetable(timetable);
  }

  function openDeleteModal(timetable: TimetableResource) {
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
                    <TimetableCard
                      key={timetable._id}
                      timetable={timetable}
                      classTitle={getRelatedTitle(timetable.class, classLabelMap)}
                      onView={openViewModal}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreateOpen ? (
        <TimetableFormModal
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          isOptionsLoading={isOptionsLoading}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editingTimetable ? (
        <TimetableFormModal
          timetable={editingTimetable}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          isOptionsLoading={isOptionsLoading}
          onClose={() => setEditingTimetable(null)}
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
          timetable={deletingTimetable}
          classTitle={getRelatedTitle(deletingTimetable.class, classLabelMap)}
          onClose={() => setDeletingTimetable(null)}
        />
      ) : null}
    </>
  );
}
