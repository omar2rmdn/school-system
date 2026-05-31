import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Attendance, AttendanceStatus } from "@/types";

type AttendanceFilters = {
  student?: string;
  class?: string;
  subject?: string;
  date?: string;
};

type AttendancePayload = {
  student: string;
  class: string;
  subject: string;
  date: string;
  status: AttendanceStatus;
};

const buildAttendanceDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const ATTENDANCE_QUERY_KEY = ["attendance"] as const;

const fetchAttendance = async (filters: AttendanceFilters) => {
  const response = await api.get<{ count: number; data: Attendance[] }>(
    "/attendance",
    {
      params: filters,
    },
  );
  return response.data.data;
};

export const useStudentAttendance = (
  studentId: string | null,
  fromDate?: Date,
  toDate?: Date,
) => {
  return useQuery({
    queryKey: [
      "attendance",
      studentId,
      fromDate?.toISOString(),
      toDate?.toISOString(),
    ],
    queryFn: async () => {
      if (!studentId) return [];

      const params: any = { student: studentId };
      // Passing startDate and endDate so the backend can be adapted to filter by range
      if (fromDate) params.startDate = fromDate.toISOString();
      if (toDate) params.endDate = toDate.toISOString();
      return fetchAttendance(params);
    },
    enabled: !!studentId,
  });
};

export const useClassAttendance = (
  classId: string | null,
  subjectId: string | null,
  selectedDate?: Date,
) => {
  const date = selectedDate ? buildAttendanceDateParam(selectedDate) : undefined;

  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, { class: classId, subject: subjectId, date }],
    queryFn: async () => {
      if (!classId || !subjectId || !date) return [];
      return fetchAttendance({ class: classId, subject: subjectId, date });
    },
    enabled: !!classId && !!subjectId && !!date,
  });
};

export const useCreateAttendance = () => {
  return useMutation({
    mutationFn: async (data: AttendancePayload) => {
      const response = await api.post<{ message: string; data: Attendance }>(
        "/attendance",
        data,
      );
      return response.data.data;
    },
  });
};

export const useUpdateAttendance = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AttendancePayload>;
    }) => {
      const response = await api.put<{ message: string; data: Attendance }>(
        `/attendance/${id}`,
        data,
      );
      return response.data.data;
    },
  });
};

export { buildAttendanceDateParam };
