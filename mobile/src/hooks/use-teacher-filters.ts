import { useState } from "react";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useAuthStore } from "@/store";
import { ClassModel, useClasses } from "@/queries/classes";
import { SubjectModel, useSubjects } from "@/queries/subjects";
import { filterTeacherItems } from "@/utils";

export function useTeacherFilters() {
  const { session } = useAuthStore();
  const { data: allClasses } = useClasses();
  const { data: allSubjects } = useSubjects();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const classes = filterTeacherItems<ClassModel>(allClasses, session?.user?.classes);

  const subjects = filterTeacherItems<SubjectModel>(allSubjects, session?.user?.subjects);

  const activeClassId = (() => {
    if (!classes.length) return null;
    return classes.some((c) => c._id === selectedClassId)
      ? selectedClassId
      : classes[0]._id;
  })();

  const activeSubjectId = (() => {
    if (!subjects.length) return null;
    return subjects.some((s) => s._id === selectedSubjectId)
      ? selectedSubjectId
      : subjects[0]._id;
  })();

  const selectedClassTitle =
    classes.find((item) => item._id === activeClassId)?.title ?? "Class";
  const selectedSubjectTitle =
    subjects.find((item) => item._id === activeSubjectId)?.title ?? "Subject";

  const handleDateChange = (_event: DateTimePickerEvent, value?: Date) => {
    setShowDatePicker(false);
    if (value) setSelectedDate(value);
  };

  return {
    classes,
    subjects,
    activeClassId,
    activeSubjectId,
    selectedClassTitle,
    selectedSubjectTitle,
    selectedDate,
    showDatePicker,
    setSelectedClassId,
    setSelectedSubjectId,
    setShowDatePicker,
    handleDateChange,
  };
}
