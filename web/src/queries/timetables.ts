import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { TimetableMutationPayload, TimetablesResponse } from "../types";

async function getTimetables() {
  const { data } = await api.get<TimetablesResponse>("/timetables");
  return data.data;
}

async function createTimetable(payload: TimetableMutationPayload) {
  const { data } = await api.post("/timetables", payload);
  return data;
}

async function updateTimetable({
  id,
  ...payload
}: TimetableMutationPayload & { id: string }) {
  const { data } = await api.put(`/timetables/${id}`, payload);
  return data;
}

async function deleteTimetable(id: string) {
  const { data } = await api.delete(`/timetables/${id}`);
  return data;
}

export function useTimetablesQuery() {
  return useQuery({
    queryKey: ["timetables"],
    queryFn: getTimetables,
  });
}

export function useCreateTimetableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTimetable,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["timetables"] });
    },
  });
}

export function useUpdateTimetableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTimetable,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["timetables"] });
    },
  });
}

export function useDeleteTimetableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTimetable,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["timetables"] });
    },
  });
}
