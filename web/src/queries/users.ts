import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import api from "../lib/api";
import type { UserMutationPayload, UserRole, UsersResponse } from "../types";

async function getUsers() {
  const { data } = await api.get<UsersResponse>("/users");
  return data.data;
}

async function createUser(payload: UserMutationPayload) {
  const { data } = await api.post("/users", payload);
  return data;
}

async function updateUser({
  id,
  ...payload
}: UserMutationPayload & { id: string }) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

async function deleteUser(id: string) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

export function getQueryErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || "Request failed";
  }

  return "Something went wrong";
}

export function useUsersQuery(role?: UserRole) {
  return useQuery({
    queryKey: ["users", role ?? "all"],
    queryFn: getUsers,
    select: (users) =>
      role ? users.filter((user) => user.role === role) : users,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
