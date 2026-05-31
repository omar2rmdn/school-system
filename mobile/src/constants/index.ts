const parentItems = [
  {
    id: "attendance",
    title: "Attendance",
    icon: "calendar-check" as const,
    color: "#10B981",
    path: "/(main)/parent/dashboard/attendance",
  },
  {
    id: "complaints",
    title: "Complaints",
    icon: "message-alert" as const,
    color: "#F59E0B",
    path: "/(main)/parent/dashboard/complaints",
  },
  {
    id: "weeklyPlan",
    title: "Weekly Plan",
    icon: "calendar-week" as const,
    color: "#F97316",
    path: "/(main)/parent/dashboard/weekly-plan",
  },
  {
    id: "finalGrades",
    title: "Final Grades",
    icon: "school" as const,
    color: "#3B82F6",
    path: "/(main)/parent/dashboard/final-grades",
  },
  {
    id: "monthlyRates",
    title: "Monthly Rates",
    icon: "chart-line" as const,
    color: "#14B8A6",
    path: "/(main)/parent/dashboard/monthly-rates",
  },
  {
    id: "activities",
    title: "Activities",
    icon: "soccer" as const,
    color: "#8B5CF6",
    path: "/(main)/parent/dashboard/activities",
  },
  {
    id: "timetable",
    title: "Timetable",
    icon: "clock-outline" as const,
    color: "#EC4899",
    path: "/(main)/parent/dashboard/timetable",
  },
];

const teacherItems = [
  {
    id: "attendance",
    title: "Attendance",
    icon: "calendar-check" as const,
    color: "#10B981",
    path: "/(main)/teacher/dashboard/attendance",
  },
  {
    id: "finalGrades",
    title: "Final Grades",
    icon: "school" as const,
    color: "#3B82F6",
    path: "/(main)/teacher/dashboard/final-grades",
  },
  {
    id: "timetable",
    title: "Timetable",
    icon: "table" as const,
    color: "#F59E0B",
    path: "/(main)/teacher/dashboard/timetable",
  },
  {
    id: "weeklyPlan",
    title: "Weekly Plan",
    icon: "calendar-week" as const,
    color: "#F97316",
    path: "/(main)/teacher/dashboard/weekly-plan",
  },
  {
    id: "monthlyRates",
    title: "Monthly Rates",
    icon: "chart-line" as const,
    color: "#14B8A6",
    path: "/(main)/teacher/dashboard/monthly-rates",
  },
];

const colors = {
  SKY: "#3a90ed",
  SKY_DARK: "#2e7091",
  SKY_LIGHT: "#f3f8ff",
  SKY_BORDER: "#DDD6FE",
  BG_COLOR: "#F8FAFC",
  TEXT_MAIN: "#1E293B",
  TEXT_SUB: "#64748B",
};

export { colors, parentItems, teacherItems };
