import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FinalGrade, Student } from "@/types";

export type TeacherStudentGradeItem = Student & { _grade?: FinalGrade | undefined };

interface TeacherGradeItemProps {
  item: TeacherStudentGradeItem;
  onOpenForm: (student: Student, grade: FinalGrade | undefined) => void;
}

export function TeacherGradeItem({ item, onOpenForm }: TeacherGradeItemProps) {
  return (
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
        onPress={() => onOpenForm(item, item._grade)}
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
}
