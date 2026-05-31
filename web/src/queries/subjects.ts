import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { TitledResource } from "../types";

type SubjectsResponse = {
  message?: string;
  data: TitledResource[];
  count?: number;
};

async function getSubjects() {
  const { data } = await api.get<SubjectsResponse>("/subjects");
  return data.data;
}

async function createSubject(payload: { title: string }) {
  const { data } = await api.post("/subjects", payload);
  return data;
}

async function updateSubject({ id, title }: { id: string; title: string }) {
  const { data } = await api.put(`/subjects/${id}`, { title });
  return data;
}

async function deleteSubject(id: string) {
  const { data } = await api.delete(`/subjects/${id}`);
  return data;
}

export function useSubjectsQuery() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
