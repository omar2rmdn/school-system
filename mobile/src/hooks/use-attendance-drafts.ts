import { useState } from "react";
import { Alert } from "react-native";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useClassStudents } from "@/queries/student";
import {
  ATTENDANCE_QUERY_KEY,
  buildAttendanceDateParam,
  useClassAttendance,
  useCreateAttendance,
  useUpdateAttendance,
} from "@/queries/attendance";
import { Attendance, AttendanceDraft, PendingAttendanceChange } from "@/types";
import { getAttendanceStudentId } from "@/utils";

export function useAttendanceDrafts(
  activeClassId: string | null,
  activeSubjectId: string | null,
  selectedDate: Date,
) {
  const queryClient = useQueryClient();

  const { data: students = [], isLoading: isLoadingStudents } =
    useClassStudents(activeClassId);

  const {
    data: attendances,
    isLoading: isLoadingAttendance,
    isFetching: isFetchingAttendance,
  } = useClassAttendance(activeClassId, activeSubjectId, selectedDate);

  const createMutation = useCreateAttendance();
  const updateMutation = useUpdateAttendance();

  const [drafts, setDrafts] = useState<Record<string, AttendanceDraft>>({});

  // Reset drafts when filters change (render-time reset — no extra render pass)
  const filterKey = `${activeClassId}-${activeSubjectId}-${selectedDate.getTime()}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setDrafts({});
  }

  const attendanceByStudentId = (() => {
    const map = new Map<string, Attendance>();
    for (const record of attendances ?? []) {
      const studentId = getAttendanceStudentId(record);
      if (studentId) map.set(studentId, record);
    }
    return map;
  })();

  const pendingChanges = ((): PendingAttendanceChange[] => {
    const changes: PendingAttendanceChange[] = [];

    for (const student of students) {
      const draft = drafts[student._id];
      const existing = attendanceByStudentId.get(student._id);

      if (!draft?.status) continue;
      if (existing && existing.status === draft.status) continue;

      changes.push({
        studentId: student._id,
        attendanceId: existing?._id,
        status: draft.status,
      });
    }

    return changes;
  })();

  const pendingStudentIds = new Set(pendingChanges.map((item) => item.studentId));

  const updateStudentDraft = (
    studentId: string,
    changes: Partial<AttendanceDraft>,
  ) => {
    setDrafts((current) => ({
      ...current,
      [studentId]: { ...current[studentId], ...changes },
    }));
  };

  const handleSave = async () => {
    if (!activeClassId || !activeSubjectId || pendingChanges.length === 0)
      return;

    const date = buildAttendanceDateParam(selectedDate);
    const results = await Promise.allSettled(
      pendingChanges.map((item) => {
        const payload = {
          student: item?.studentId,
          class: activeClassId,
          subject: activeSubjectId,
          date,
          status: item?.status,
        };

        return item?.attendanceId
          ? updateMutation.mutateAsync({
              id: item?.attendanceId,
              data: payload,
            })
          : createMutation.mutateAsync(payload);
      }),
    );

    const failed = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );

    await queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });

    if (failed.length === 0) {
      Alert.alert(
        "Attendance saved",
        `Saved ${results.length} attendance records.`,
      );
      return;
    }

    const firstError = failed[0].reason;
    const errorMessage = isAxiosError(firstError)
      ? firstError.response?.data?.message || firstError.message
      : "An unexpected error occurred while saving attendance.";

    Alert.alert(
      "Partial save",
      `${results.length - failed.length} records saved. ${failed.length} failed.\n\n${errorMessage}`,
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const getDraft = (studentId: string): AttendanceDraft => {
    return (
      drafts[studentId] ?? {
        attendanceId: attendanceByStudentId.get(studentId)?._id,
        status: attendanceByStudentId.get(studentId)?.status,
      }
    );
  };

  return {
    students,
    isLoadingStudents,
    isLoadingAttendance,
    isFetchingAttendance,
    pendingChanges,
    pendingStudentIds,
    isSaving,
    getDraft,
    updateStudentDraft,
    handleSave,
  };
}
