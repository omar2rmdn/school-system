import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { forwardRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "@/components/templates/bottom-sheet";
import { BottomSheetMethods } from "@/components/templates/bottom-sheet/types";
import { useParentStudents } from "@/queries/student";
import { useStudentStore } from "@/store/student";

interface StudentSelectionSheetProps {
  onSelect?: (studentId: string) => void;
}

export const StudentSelectionSheet = forwardRef<
  BottomSheetMethods,
  StudentSelectionSheetProps
>((props, ref) => {
  const { data: students, isLoading } = useParentStudents();
  const { selectedStudentId, setSelectedStudentId } = useStudentStore();

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (ref && typeof ref !== "function" && "current" in ref) {
      ref.current?.close();
    }
    if (props.onSelect) {
      props.onSelect(studentId);
    }
  };

  return (
    <BottomSheet
      ref={ref}
      snapPoints={["50%"]}
      enableBackdrop={true}
      backgroundColor="#ffffff"
      sheetStyle={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 20,
      }}
    >
      <View className="flex-1 p-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Select Student
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : students && students.length > 0 ? (
          <ScrollView className="flex-1">
            {students.map((student) => (
              <TouchableOpacity
                key={student._id}
                onPress={() => handleStudentSelect(student._id)}
                className={`flex-row items-center p-4 mb-3 rounded-xl border ${
                  selectedStudentId === student._id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mr-4">
                  <Ionicons name="person" size={24} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </Text>
                </View>
                {selectedStudentId === student._id && (
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No students found.</Text>
          </View>
        )}
      </View>
    </BottomSheet>
  );
});

StudentSelectionSheet.displayName = "StudentSelectionSheet";
