import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppEvent } from "@/types";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await api.get<{ data: AppEvent[] }>(`/events`);
      return response.data.data;
    },
  });
};
