import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { EventResource } from "../types";

type EventsResponse = {
  message?: string;
  data: EventResource[];
  count?: number;
};

async function getEvents() {
  const { data } = await api.get<EventsResponse>("/events");
  return data.data;
}

type EventMutationPayload = {
  title: string;
  description: string;
};

async function createEvent(payload: EventMutationPayload) {
  const { data } = await api.post("/events", payload);
  return data;
}

async function updateEvent({
  id,
  ...payload
}: EventMutationPayload & { id: string }) {
  const { data } = await api.put(`/events/${id}`, payload);
  return data;
}

async function deleteEvent(id: string) {
  const { data } = await api.delete(`/events/${id}`);
  return data;
}

export function useEventsQuery() {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
