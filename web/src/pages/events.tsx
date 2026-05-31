import { type SubmitEvent, useState } from "react";

import DeleteEventModal from "../components/modal/delete-event-modal";
import EventFormModal from "../components/modal/event-form-modal";
import type { EventResource } from "../types";
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useEventsQuery,
  useUpdateEventMutation,
} from "../queries/events";
import { getQueryErrorMessage } from "../queries/users";

export default function Events() {
  const { data = [], isLoading, error } = useEventsQuery();
  const createEventMutation = useCreateEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const deleteEventMutation = useDeleteEventMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResource | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventResource | null>(
    null,
  );
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const listErrorMessage = error ? getQueryErrorMessage(error) : undefined;
  const createErrorMessage = createEventMutation.error
    ? getQueryErrorMessage(createEventMutation.error)
    : undefined;
  const updateErrorMessage = updateEventMutation.error
    ? getQueryErrorMessage(updateEventMutation.error)
    : undefined;
  const deleteErrorMessage = deleteEventMutation.error
    ? getQueryErrorMessage(deleteEventMutation.error)
    : undefined;

  async function handleCreateSubmit(event: SubmitEvent) {
    event.preventDefault();

    const title = createTitle.trim();
    const description = createDescription.trim();
    if (!title || !description) {
      return;
    }

    await createEventMutation.mutateAsync({ title, description });
    setCreateTitle("");
    setCreateDescription("");
    setIsCreateOpen(false);
  }

  async function handleEditSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!editingEvent) {
      return;
    }

    const title = editTitle.trim();
    const description = editDescription.trim();
    if (!title || !description) {
      return;
    }

    await updateEventMutation.mutateAsync({
      id: editingEvent._id,
      title,
      description,
    });
    setEditTitle("");
    setEditDescription("");
    setEditingEvent(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingEvent) {
      return;
    }

    await deleteEventMutation.mutateAsync(deletingEvent._id);
    setDeletingEvent(null);
  }

  function openCreateModal() {
    createEventMutation.reset();
    setCreateTitle("");
    setCreateDescription("");
    setIsCreateOpen(true);
  }

  function openEditModal(resource: EventResource) {
    updateEventMutation.reset();
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    setEditingEvent(resource);
  }

  function openDeleteModal(resource: EventResource) {
    deleteEventMutation.reset();
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
                    <tr key={resource._id}>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {resource.title}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {resource.description}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(resource)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(resource)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
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
        <EventFormModal
          mode="create"
          titleValue={createTitle}
          descriptionValue={createDescription}
          errorMessage={createErrorMessage}
          isSubmitting={createEventMutation.isPending}
          onTitleChange={setCreateTitle}
          onDescriptionChange={setCreateDescription}
          onClose={() => {
            createEventMutation.reset();
            setCreateTitle("");
            setCreateDescription("");
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      ) : null}

      {editingEvent ? (
        <EventFormModal
          mode="edit"
          titleValue={editTitle}
          descriptionValue={editDescription}
          errorMessage={updateErrorMessage}
          isSubmitting={updateEventMutation.isPending}
          onTitleChange={setEditTitle}
          onDescriptionChange={setEditDescription}
          onClose={() => {
            updateEventMutation.reset();
            setEditTitle("");
            setEditDescription("");
            setEditingEvent(null);
          }}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {deletingEvent ? (
        <DeleteEventModal
          resource={deletingEvent}
          errorMessage={deleteErrorMessage}
          isSubmitting={deleteEventMutation.isPending}
          onClose={() => {
            deleteEventMutation.reset();
            setDeletingEvent(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
