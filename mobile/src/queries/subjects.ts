import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type SubjectModel = {
  _id: string;
  title: string;
};

export const SUBJECTS_QUERY_KEY = ["subjects"] as const;
export const SUBJECTS_STALE_TIME = 1000 * 60 * 30;
export const SUBJECTS_GC_TIME = 1000 * 60 * 60 * 24;

export const fetchSubjects = async () => {
  const response = await api.get<{ count: number; data: SubjectModel[] }>(
    "/subjects",
  );
  return response.data.data;
};

export const useSubjects = () => {
  return useQuery({
    queryKey: SUBJECTS_QUERY_KEY,
    queryFn: fetchSubjects,
    staleTime: SUBJECTS_STALE_TIME,
    gcTime: SUBJECTS_GC_TIME,
  });
};
