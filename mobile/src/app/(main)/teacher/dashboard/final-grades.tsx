import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
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

      <View className="flex-1 px-6 mt-4">
        {!activeClassId || !activeSubjectId ? (
          <View className="flex-1 items-center justify-center pb-20">
            <Ionicons name="funnel-outline" size={64} color="#cbd5e1" />
            <Text className="text-lg text-slate-500 mt-4 text-center">
              Please select a class and subject
            </Text>
          </View>
        ) : isLoadingStudents || isLoadingGrades ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : !students || students.length === 0 ? (
          <View className="flex-1 items-center justify-center pb-20">
            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
            <Text className="text-lg text-slate-500 mt-4 text-center">
              No students found in this class
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {students.map((student) => {
              const studentGrade = getStudentGrade(student._id);

              return (
                <View
                  key={student._id}
                  className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-4">
                    <Text className="text-base font-bold text-slate-800">
                      {student.firstName} {student.lastName}
                    </Text>
                    {studentGrade ? (
                      <Text className="text-sm text-slate-500 mt-1">
                        Year: {studentGrade.academicYear} | Term:{" "}
                        {studentGrade.term === "first" ? "First" : "Second"}
                      </Text>
                    ) : (
                      <Text className="text-sm text-slate-400 mt-1">
                        No grade assigned
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleOpenForm(student, studentGrade)}
                    className={`px-4 py-2 rounded-lg flex-row items-center ${
                      studentGrade ? "bg-amber-100" : "bg-indigo-100"
                    }`}
                  >
                    {studentGrade ? (
                      <>
                        <Text className="text-amber-700 font-bold mr-2 text-lg">
                          {studentGrade.score}
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
            })}
          </ScrollView>
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
