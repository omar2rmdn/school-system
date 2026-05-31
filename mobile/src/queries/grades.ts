import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FinalGrade } from "@/types";

export const useStudentFinalGrades = (studentId: string | null) => {
  return useQuery({
    queryKey: ["final-grades", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      // Calls the /final-grades/student/:studentId endpoint as defined in the postman collection
      const response = await api.get<{ data: FinalGrade[] }>(
        `/final-grades/student/${studentId}`,
      );
      return response.data.data;
    },
    enabled: !!studentId,
  });
};

export const useClassFinalGrades = (filters: {
  student?: string;
  subject?: string;
  academicYear?: string;
  term?: string;
}) => {
  return useQuery({
    queryKey: ["final-grades", filters],
    queryFn: async () => {
      const response = await api.get<{ count: number; data: FinalGrade[] }>(
        "/final-grades",
        {
          params: filters,
        },
      );
      return response.data.data;
    },
    enabled: !!filters.student || !!filters.subject,
  });
};

export const useCreateFinalGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<FinalGrade>) => {
      const response = await api.post<{ message: string; data: FinalGrade }>(
        "/final-grades",
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["final-grades"] });
    },
  });
};

export const useUpdateFinalGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<FinalGrade>;
    }) => {
      const response = await api.put<{ message: string; data: FinalGrade }>(
        `/final-grades/${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["final-grades"] });
    },
  });
};
