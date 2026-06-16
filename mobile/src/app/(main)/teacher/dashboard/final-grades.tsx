import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
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

  const handleOpenForm = (
    student: Student,
    grade: FinalGrade | undefined,
  ) => {
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

  type StudentItem = Student & { _grade?: FinalGrade | undefined };

  const studentItems: StudentItem[] = (students ?? []).map((student) => ({
    ...student,
    _grade: getStudentGrade(student._id),
  }));

  const renderStudentItem = ({ item }: { item: StudentItem }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100 flex-row items-center justify-between">
      <View className="flex-1 mr-4">
        <Text className="text-base font-bold text-slate-800">
          {item.firstName} {item.lastName}
        </Text>
        {item._grade ? (
          <Text className="text-sm text-slate-500 mt-1">
            Year: {item._grade.academicYear} | Term:{" "}
            {item._grade.term === "first" ? "First" : "Second"}
          </Text>
        ) : (
          <Text className="text-sm text-slate-400 mt-1">
            No grade assigned
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => handleOpenForm(item, item._grade)}
        className={`px-4 py-2 rounded-lg flex-row items-center ${
          item._grade ? "bg-amber-100" : "bg-indigo-100"
        }`}
      >
        {item._grade ? (
          <>
            <Text className="text-amber-700 font-bold mr-2 text-lg">
              {item._grade.score}
            </Text>
            <Ionicons name="pencil" size={16} color="#b45309" />
          </>
        ) : (
          <>
            <Text className="text-indigo-700 font-semibold mr-1">
              Add
            </Text>
            <Ionicons name="add" size={18} color="#4f46e5" />
          </>
        )}
      </TouchableOpacity>
    </View>
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
            renderItem={renderStudentItem}
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
