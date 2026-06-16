import { View, Text } from "react-native";
import { SafeView } from "@/components/common/safe-view";
import { useClassStudents } from "@/queries/student";
import { useClassFinalGrades } from "@/queries/grades";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { useTeacherFilters } from "@/hooks/use-teacher-filters";
import { FilterChips } from "@/components/common/filter-chips";
import { FinalGradeSheet } from "@/components/sheets/final-grade-sheet";
import { BottomSheetMethods } from "@/components/templates/bottom-sheet/types";
import { FinalGrade, Student } from "@/types";
import { DashboardList } from "@/components/cards/dashboard-list";
import {
  TeacherGradeItem,
  TeacherStudentGradeItem,
} from "@/components/list-items";

export default function FinalGrades() {
  const {
    classes,
    subjects,
    activeClassId,
    activeSubjectId,
    setSelectedClassId,
    setSelectedSubjectId,
  } = useTeacherFilters();

  const { data: students, isLoading: isLoadingStudents } =
    useClassStudents(activeClassId);
  const { data: grades, isLoading: isLoadingGrades } = useClassFinalGrades({
    subject: activeSubjectId || undefined,
  });

  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [existingGrade, setExistingGrade] = useState<FinalGrade | null>(null);

  const handleOpenForm = (student: Student, grade: FinalGrade | undefined) => {
    setEditingStudent(student);
    setExistingGrade(grade || null);
    bottomSheetRef.current?.expand();
  };

  const getStudentGrade = (studentId: string) => {
    return grades?.find((g) => {
      const gStudentId =
        typeof g.student === "object" ? g.student._id : g.student;
      return gStudentId === studentId;
    });
  };

  const studentItems: TeacherStudentGradeItem[] = (students ?? []).map(
    (student) => ({
      ...student,
      _grade: getStudentGrade(student._id),
    }),
  );

  return (
    <SafeView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-800">Final Grades</Text>
      </View>

      <View className="px-6 mt-2">
        <FilterChips
          items={classes}
          activeId={activeClassId}
          onSelect={setSelectedClassId}
          label="Select Class"
        />

        <View className="mt-4">
          <FilterChips
            items={subjects}
            activeId={activeSubjectId}
            onSelect={setSelectedSubjectId}
            label="Select Subject"
            activeColor="emerald"
          />
        </View>
      </View>

      <View className="flex-1 mt-4">
        {!activeClassId || !activeSubjectId ? (
          <View className="flex-1 items-center justify-center pb-20 px-6">
            <Ionicons name="funnel-outline" size={64} color="#cbd5e1" />
            <Text className="text-lg text-slate-500 mt-4 text-center">
              Please select a class and subject
            </Text>
          </View>
        ) : (
          <DashboardList
            variant="list"
            data={studentItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TeacherGradeItem item={item} onOpenForm={handleOpenForm} />
            )}
            isLoading={isLoadingStudents || isLoadingGrades}
            loadingColor="#4f46e5"
            emptyIcon="people-outline"
            emptyMessage="No students found in this class"
          />
        )}
      </View>

      <FinalGradeSheet
        ref={bottomSheetRef}
        student={editingStudent}
        existingGrade={existingGrade}
        selectedSubjectId={activeSubjectId}
      />
    </SafeView>
  );
}
