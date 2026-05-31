import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  LayoutGrid,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

export const navigationIcons = {
  classes: LayoutGrid,
  subjects: BookOpen,
  students: UserPlus,
  parents: Users,
  teachers: GraduationCap,
  admins: ShieldCheck,
  supervisors: UserCog,
  timetables: CalendarDays,
  events: CalendarCheck,
};

export const navigationItems = [
  { label: "Classes", path: "/classes", icon: navigationIcons.classes },
  { label: "Subjects", path: "/subjects", icon: navigationIcons.subjects },
  { label: "Students", path: "/students", icon: navigationIcons.students },
  { label: "Parents", path: "/parents", icon: navigationIcons.parents },
  { label: "Teachers", path: "/teachers", icon: navigationIcons.teachers },
  { label: "Admins", path: "/admins", icon: navigationIcons.admins },
  {
    label: "Supervisors",
    path: "/supervisors",
    icon: navigationIcons.supervisors,
  },
  {
    label: "Timetables",
    path: "/timetables",
    icon: navigationIcons.timetables,
  },
  { label: "Events", path: "/events", icon: navigationIcons.events },
] as const;
