import { useState } from "react";

import DeleteEventModal from "../components/modal/delete-event-modal";
import EventFormModal from "../components/modal/event-form-modal";
import type { EventResource } from "../types";
import { useEventsQuery } from "../queries/events";
import { getQueryErrorMessage } from "../queries/users";
import { EventCard } from "../components/cards/event-card";

export default function Events() {
  const { data = [], isLoading, error } = useEventsQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResource | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventResource | null>(
    null,
  );

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;

  function openCreateModal() {
    setIsCreateOpen(true);
  }

  function openEditModal(resource: EventResource) {
    setEditingEvent(resource);
  }

  function openDeleteModal(resource: EventResource) {
    setDeletingEvent(resource);
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Events</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {data.length}
              </p>
              <p className="mt-1 text-sm text-slate-600">Total events</p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Event
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Title
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
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
                      colSpan={3}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : listErrorMessage ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-sm text-red-600">
                      {listErrorMessage}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-sm text-slate-500"
                    >
                      No events found.
                    </td>
                  </tr>
                ) : (
                  data.map((resource) => (
                    <EventCard
                      key={resource._id}
                      resource={resource}
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
        <EventFormModal onClose={() => setIsCreateOpen(false)} />
      )}

      {editingEvent && (
        <EventFormModal
          resource={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {deletingEvent && (
        <DeleteEventModal
          resource={deletingEvent}
          onClose={() => setDeletingEvent(null)}
        />
      )}
    </>
  );
}
