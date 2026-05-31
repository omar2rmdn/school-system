import type { Dispatch, SetStateAction, SubmitEvent } from "react";

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

type ProtectedProps = {
  allowedRoles?: string[];
};

type SectionPageProps = {
  title: string;
  description: string;
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

type AdminFormModalProps = {
  mode: "create" | "edit";
  values: AdminFormValues;
  errorMessage?: string;
  isSubmitting: boolean;
  onValuesChange: (values: AdminFormValues) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type ParentFormModalProps = {
  mode: "create" | "edit";
  values: ParentFormValues;
  errorMessage?: string;
  isSubmitting: boolean;
  onValuesChange: (values: ParentFormValues) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type SupervisorFormModalProps = {
  mode: "create" | "edit";
  values: SupervisorFormValues;
  errorMessage?: string;
  isSubmitting: boolean;
  onValuesChange: (values: SupervisorFormValues) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type TeacherFormModalProps = {
  mode: "create" | "edit";
  values: TeacherFormValues;
  errorMessage?: string;
  isSubmitting: boolean;
  classOptions: ClassResource[];
  subjectOptions: SubjectResource[];
  isOptionsLoading: boolean;
  onValuesChange: (values: TeacherFormValues) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type StudentFormModalProps = {
  mode: "create" | "edit";
  values: StudentFormValues;
  classOptions: { id: string; title: string }[];
  errorMessage?: string;
  isSubmitting: boolean;
  isOptionsLoading: boolean;
  onChange: <K extends keyof StudentFormValues>(
    key: K,
    value: StudentFormValues[K],
  ) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type ClassFormModalProps = {
  mode: "create" | "edit";
  titleValue: string;
  errorMessage?: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type SubjectFormModalProps = {
  mode: "create" | "edit";
  titleValue: string;
  errorMessage?: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type EventFormModalProps = {
  mode: "create" | "edit";
  titleValue: string;
  descriptionValue: string;
  errorMessage?: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type DeleteAdminModalProps = {
  admin: User;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type DeleteParentModalProps = {
  parent: User;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type DeleteTeacherModalProps = {
  teacher: User;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type DeleteSupervisorModalProps = {
  supervisor: User;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type DeleteStudentModalProps = {
  student: Student;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type DeleteClassModalProps = {
  resource: ClassResource;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type DeleteSubjectModalProps = {
  resource: SubjectResource;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type DeleteEventModalProps = {
  resource: EventResource;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type TimetableFormModalProps = {
  mode: "create" | "edit";
  values: TimetableFormValues;
  classOptions: { id: string; title: string }[];
  subjectOptions: { id: string; title: string }[];
  errorMessage?: string;
  isSubmitting: boolean;
  isOptionsLoading: boolean;
  onChange: <K extends keyof TimetableFormValues>(
    key: K,
    value: TimetableFormValues[K],
  ) => void;
  onClose: () => void;
  onSubmit: (event: SubmitEvent) => void;
};

type DeleteTimetableModalProps = {
  classTitle: string;
  errorMessage?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type TimetableDetailsModalProps = {
  timetable: TimetableResource;
  classTitle: string;
  subjectLabelMap: Map<string, string>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export type {
  AuthState,
  AuthContextType,
  AuthSetter,
  AdminFormModalProps,
  AdminFormValues,
  ClassFormModalProps,
  ClassResource,
  ClassesResponse,
  DaySlot,
  DeleteAdminModalProps,
  DeleteClassModalProps,
  DeleteEventModalProps,
  DeleteParentModalProps,
  DeleteStudentModalProps,
  DeleteSubjectModalProps,
  DeleteSupervisorModalProps,
  DeleteTeacherModalProps,
  DeleteTimetableModalProps,
  EventFormModalProps,
  EventMutationPayload,
  EventResource,
  EventsResponse,
  ParentFormModalProps,
  ParentFormValues,
  ProtectedProps,
  RelatedResource,
  SectionPageProps,
  Student,
  StudentFormModalProps,
  StudentFormValues,
  StudentMutationPayload,
  StudentsResponse,
  SubjectFormModalProps,
  SubjectResource,
  SubjectsResponse,
  SupervisorFormModalProps,
  SupervisorFormValues,
  TeacherFormModalProps,
  TeacherFormValues,
  TeachingResource,
  TimetableDay,
  TimetableDetailsModalProps,
  TimetableFormModalProps,
  TimetableFormValues,
  TimetableMutationPayload,
  TimetableResource,
  TimetablesResponse,
  User,
  UserMutationPayload,
  UserRole,
  UsersResponse,
};
