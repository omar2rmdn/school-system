import React from "react";
import { View, Text } from "react-native";
import { FinalGrade, SubjectRef } from "@/types";
import { getGradeColor } from "@/utils";

interface GradeItemProps {
  item: FinalGrade;
  subjects?: SubjectRef[];
}

export function GradeItem({ item, subjects }: GradeItemProps) {
  const subjectId =
    typeof item.subject === "string" ? item.subject : item.subject._id;
  const subjectTitle =
    typeof item.subject === "string"
      ? subjects?.find((subject) => subject._id === subjectId)?.title ||
        "Unknown Subject"
      : item.subject?.name ||
        item.subject?.title ||
        subjects?.find((subject) => subject._id === subjectId)?.title ||
        "Unknown Subject";

  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100 flex-row items-center">
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-800 mb-1">
          {subjectTitle}
        </Text>
        <Text className="text-sm text-slate-500">
          {item.academicYear} •{" "}
          {item.term === "first" ? "First Term" : "Second Term"}
        </Text>
      </View>
      <View
        className={`w-14 h-14 rounded-full items-center justify-center ml-4 ${
          getGradeColor(item.score).split(" ")[1]
        }`}
      >
        <Text
          className={`text-lg font-bold ${getGradeColor(item.score).split(" ")[0]}`}
        >
          {item.score}
        </Text>
      </View>
    </View>
  );
}
