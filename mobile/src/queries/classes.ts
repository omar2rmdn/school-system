import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ClassModel = {
  _id: string;
  title: string;
};

export const CLASSES_QUERY_KEY = ["classes"] as const;
export const CLASSES_STALE_TIME = 1000 * 60 * 30;
export const CLASSES_GC_TIME = 1000 * 60 * 60 * 24;

export const fetchClasses = async () => {
  const response = await api.get<{ count: number; data: ClassModel[] }>(
    "/classes",
  );
  return response.data.data;
};

export const useClasses = () => {
  return useQuery({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: fetchClasses,
    staleTime: CLASSES_STALE_TIME,
    gcTime: CLASSES_GC_TIME,
  });
};
