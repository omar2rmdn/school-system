import { useAuthStore } from "@/store";
import { Stack } from "@/lib/router";
import { TransitionPresets } from "@react-navigation/stack";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CLASSES_GC_TIME,
  CLASSES_QUERY_KEY,
  CLASSES_STALE_TIME,
  fetchClasses,
} from "@/queries/classes";
import {
  fetchSubjects,
  SUBJECTS_GC_TIME,
  SUBJECTS_QUERY_KEY,
  SUBJECTS_STALE_TIME,
} from "@/queries/subjects";

export default function MainLayout() {
  const role = useAuthStore((state) => state.session?.user.role ?? null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (role !== "teacher") return;

    void Promise.all([
      queryClient.prefetchQuery({
        queryKey: CLASSES_QUERY_KEY,
        queryFn: fetchClasses,
        staleTime: CLASSES_STALE_TIME,
        gcTime: CLASSES_GC_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: SUBJECTS_QUERY_KEY,
        queryFn: fetchSubjects,
        staleTime: SUBJECTS_STALE_TIME,
        gcTime: SUBJECTS_GC_TIME,
      }),
    ]);
  }, [queryClient, role]);

  return (
    <Stack
      detachInactiveScreens
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        detachPreviousScreen: true,
      }}
    >
      <Stack.Protected guard={role === "teacher"}>
        <Stack.Screen name="teacher" />
      </Stack.Protected>

      <Stack.Protected guard={role === "parent"}>
        <Stack.Screen name="parent" />
      </Stack.Protected>

      <Stack.Protected guard={role === "supervisor"}>
        <Stack.Screen name="supervisor" />
      </Stack.Protected>
    </Stack>
  );
}
