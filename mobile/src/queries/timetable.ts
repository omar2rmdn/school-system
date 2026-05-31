import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Timetable } from "@/types";

export const useClassTimetable = (classId: string | null) => {
  return useQuery({
    queryKey: ["timetable", classId],
    queryFn: async () => {
      if (!classId) return [];

      const response = await api.get<{ count: number; data: Timetable[] }>(
        `/timetables`,
        {
          params: { class: classId },
        },
      );
      return response.data.data;
    },
    enabled: !!classId,
  });
};
