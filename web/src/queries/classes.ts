import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { ClassesResponse } from "../types";

async function getClasses() {
  const { data } = await api.get<ClassesResponse>("/classes");
  return data.data;
}

async function createClass(payload: { title: string }) {
  const { data } = await api.post("/classes", payload);
  return data;
}

async function updateClass({ id, title }: { id: string; title: string }) {
  const { data } = await api.put(`/classes/${id}`, { title });
  return data;
}

async function deleteClass(id: string) {
  const { data } = await api.delete(`/classes/${id}`);
  return data;
}

export function useClassesQuery() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });
}

export function useCreateClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClass,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClass,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useDeleteClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClass,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
