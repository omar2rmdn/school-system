export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"];

export const parentItems = [
  {
    id: 1,
    title: "Attendance",
    icon: "calendar",
    description: "Check presence and absences",
    color: "text-blue-600",
    bg: "bg-blue-100",
    path: "/parent/dashboard/attendance",
  },
  {
    id: 2,
    title: "Final Grades",
    icon: "school",
    description: "Academic performance and results",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    path: "/parent/dashboard/grades",
  },
  {
    id: 3,
    title: "Timetable",
    icon: "time",
    description: "Class schedules and timings",
    color: "text-purple-600",
    bg: "bg-purple-100",
    path: "/parent/dashboard/timetable",
  },
  {
    id: 4,
    title: "Complaints",
    icon: "warning",
    description: "Submit and track issues",
    color: "text-orange-600",
    bg: "bg-orange-100",
    path: "/parent/dashboard/complaints",
  },
  {
    id: 5,
    title: "Events",
    icon: "megaphone",
    description: "Upcoming school activities",
    color: "text-pink-600",
    bg: "bg-pink-100",
    path: "/parent/dashboard/events",
  },
] as const;

export const teacherItems = [
  {
    id: 1,
    title: "Attendance",
    icon: "calendar",
    description: "Manage student attendance",
    color: "text-blue-600",
    bg: "bg-blue-100",
    path: "/teacher/dashboard/attendance",
  },
  {
    id: 2,
    title: "Final Grades",
    icon: "school",
    description: "Manage student grades",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    path: "/teacher/dashboard/final-grades",
  },
  {
    id: 3,
    title: "Timetable",
    icon: "time",
    description: "View class schedules",
    color: "text-purple-600",
    bg: "bg-purple-100",
    path: "/teacher/dashboard/timetable",
  },
] as const;

import { AttendanceStatus } from "@/types";

export const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  accentClassName: string;
}[] = [
  {
    value: "present",
    label: "Present",
    accentClassName: "border-emerald-200 bg-emerald-50",
  },
  {
    value: "late",
    label: "Late",
    accentClassName: "border-orange-200 bg-orange-50",
  },
  {
    value: "absent",
    label: "Absent",
    accentClassName: "border-red-200 bg-red-50",
  },
  {
    value: "excused",
    label: "Excused",
    accentClassName: "border-sky-200 bg-sky-50",
  },
];

export const STATUS_ICON_COLORS: Record<AttendanceStatus | "unknown", string> = {
  present: "#059669",
  absent: "#dc2626",
  late: "#ea580c",
  excused: "#0369a1",
  unknown: "#64748b",
};
