type UserRole = "admin" | "parent" | "teacher" | "supervisor";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  classes?: string[];
  subjects?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User;
  accessToken: string;
}

interface TitledResource {
  _id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EventResource extends TitledResource {
  description: string;
}

type TimetableDay = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";

interface TimetableResource {
  _id: string;
  class: string | TitledResource;
  days: {
    day: TimetableDay;
    subject: string | TitledResource;
    startTime: string;
    endTime: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  class?: string | TitledResource;
  className?: string;
  parentPhone?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type {
  User,
  AuthState,
  UserRole,
  TitledResource,
  EventResource,
  TimetableDay,
  TimetableResource,
  Student,
};
