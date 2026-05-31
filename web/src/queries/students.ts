import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { Student } from "../types";

type StudentsResponse = {
  message?: string;
  data: Student[];
  count?: number;
};

async function getStudents() {
  const { data } = await api.get<StudentsResponse>("/students");
  return data.data;
}

type StudentMutationPayload = {
  firstName: string;
  lastName: string;
  class: string;
  parentPhone: string;
};

async function createStudent(payload: StudentMutationPayload) {
  const { data } = await api.post("/students", payload);
  return data;
}

async function updateStudent({
  id,
  ...payload
}: StudentMutationPayload & { id: string }) {
  const { data } = await api.put(`/students/${id}`, payload);
  return data;
}

async function deleteStudent(id: string) {
  const { data } = await api.delete(`/students/${id}`);
  return data;
}

export function useStudentsQuery() {
  return useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
