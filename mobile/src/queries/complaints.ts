import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Complaint } from "@/types";

type CreateComplaintPayload = {
  studentId: string;
  title: string;
  description: string;
};

export const useStudentComplaints = (studentId: string | null) => {
  return useQuery({
    queryKey: ["complaints", studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const response = await api.get<Complaint[]>("/complaints", {
        params: { studentId },
      });

      return response.data;
    },
    enabled: !!studentId,
  });
};

export const useComplaints = (studentId?: string | null) => {
  return useQuery({
    queryKey: ["complaints", studentId ?? null],
    queryFn: async () => {
      const response = await api.get<Complaint[]>("/complaints", {
        params: studentId ? { studentId } : undefined,
      });

      return response.data;
    },
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateComplaintPayload) => {
      const response = await api.post<Complaint>("/complaints", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

export const useMarkComplaintAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintId: string) => {
      const response = await api.patch<Complaint>(`/complaints/${complaintId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};
