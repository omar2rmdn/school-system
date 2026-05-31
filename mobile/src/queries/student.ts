import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Student } from "@/types";

export const useParentStudents = () => {
  return useQuery({
    queryKey: ["parent-students"],
    queryFn: async () => {
      const response = await api.get<{ data: Student[] }>("/students/parent");
      return response.data.data;
    },
  });
};

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await api.get<{ count: number; data: Student[] }>("/students");
      return response.data.data;
    },
  });
};

export const useClassStudents = (classId: string | null) => {
  return useQuery({
    queryKey: ["students", { class: classId }],
    queryFn: async () => {
      if (!classId) return [];
      const response = await api.get<{ count: number; data: Student[] }>(
        "/students",
        {
          params: { class: classId },
        },
      );
      return response.data.data;
    },
    enabled: !!classId,
  });
};
