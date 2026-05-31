export type UserRole = "teacher" | "parent" | "supervisor";

export type Student = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  class?: any;
};

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type Attendance = {
  _id: string;
  student: Student | string;
  class: { _id: string; title?: string } | string;
  subject: SubjectRef | string;
  date: string;
  status: AttendanceStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type FinalGrade = {
  _id: string;
  student: Student | string;
  subject: SubjectRef | string;
  academicYear: string;
  term: "first" | "second";
  score: number;
};

export type SubjectRef = {
  _id: string;
  name?: string;
  title?: string;
};

export type TimetableEntry = {
  _id?: string;
  day: string;
  subject: SubjectRef | string;
  startTime: string;
  endTime: string;
};

export type Timetable = {
  _id: string;
  class: { _id: string; title?: string } | string;
  days: TimetableEntry[];
};

export type Complaint = {
  _id: string;
  sender:
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        role?: string;
      }
    | string;
  student:
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
      }
    | string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AppEvent = {
  _id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  classes: unknown[];
  subjects: unknown[];
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type LoginResponse = {
  message: string;
  data: AuthSession;
};

export type AttendanceDraft = {
  attendanceId?: string;
  status?: AttendanceStatus;
};

export type PendingAttendanceChange = {
  studentId: string;
  attendanceId?: string;
  status: AttendanceStatus;
};
