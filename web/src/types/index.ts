import type { Dispatch, SetStateAction } from "react";

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

type AuthSetter = Dispatch<SetStateAction<AuthState | null>> | null;

interface AuthContextType {
  auth: AuthState | null;
  setAuth: Dispatch<SetStateAction<AuthState | null>>;
  isReady: boolean;
}

interface ClassResource {
  _id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SubjectResource {
  _id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EventResource {
  _id: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

type TimetableDay = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";

interface TimetableResource {
  _id: string;
  class: string | ClassResource;
  days: {
    day: TimetableDay;
    subject: string | SubjectResource;
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
  class?: string | ClassResource;
  className?: string;
  parentPhone?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

type ApiResponse<T> = {
  message?: string;
  data: T[];
  count?: number;
};

type ClassesResponse = ApiResponse<ClassResource>;
type SubjectsResponse = ApiResponse<SubjectResource>;
type EventsResponse = ApiResponse<EventResource>;
type TimetablesResponse = ApiResponse<TimetableResource>;
type StudentsResponse = ApiResponse<Student>;
type UsersResponse = ApiResponse<User>;

type UserMutationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  classes?: string[];
  subjects?: string[];
};

type StudentMutationPayload = {
  firstName: string;
  lastName: string;
  class: string;
  parentPhone: string;
};

type EventMutationPayload = {
  title: string;
  description: string;
};

type TimetableMutationPayload = {
  class?: string;
  days: {
    day: TimetableDay;
    subject: string;
    startTime: string;
    endTime: string;
  }[];
};

type TeachingResource = ClassResource | SubjectResource;
type RelatedResource = ClassResource | SubjectResource;

type AdminFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type ParentFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type SupervisorFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type TeacherFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  classes: string[];
  subjects: string[];
};

type StudentFormValues = {
  firstName: string;
  lastName: string;
  class: string;
  parentPhone: string;
};

type DaySlot = {
  day: TimetableDay;
  startTime: string;
  endTime: string;
  subject: string;
};

type TimetableFormValues = {
  class: string;
  days: DaySlot[];
};

export type {
  AuthState,
  AuthContextType,
  AuthSetter,
  AdminFormValues,
  ClassResource,
  ClassesResponse,
  DaySlot,
  EventMutationPayload,
  EventResource,
  EventsResponse,
  ParentFormValues,
  RelatedResource,
  Student,
  StudentFormValues,
  StudentMutationPayload,
  StudentsResponse,
  SubjectResource,
  SubjectsResponse,
  SupervisorFormValues,
  TeacherFormValues,
  TeachingResource,
  TimetableDay,
  TimetableFormValues,
  TimetableMutationPayload,
  TimetableResource,
  TimetablesResponse,
  User,
  UserMutationPayload,
  UserRole,
  UsersResponse,
};
