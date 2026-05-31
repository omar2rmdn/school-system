import type { FormEvent } from "react";
import type { TimetableDay, TimetableResource } from "../../types";

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
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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

const defaultFormValues: TimetableFormValues = {
  class: "",
  days: [{ day: "Sunday", startTime: "", endTime: "", subject: "" }],
};

export type {
  DaySlot,
  TimetableDetailsModalProps,
  TimetableFormModalProps,
  TimetableFormValues,
  DeleteTimetableModalProps,
};
export { defaultFormValues };
