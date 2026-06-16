import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatTime, getSubjectLabel } from "@/utils";
import { TimetableEntry } from "@/types";

interface TimetableItemProps {
  item: TimetableEntry;
}

export function TimetableItem({ item }: TimetableItemProps) {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100 flex-row items-center">
      <View className="w-16 h-16 rounded-full bg-indigo-50 items-center justify-center mr-4 border border-indigo-100">
        <Ionicons name="time-outline" size={24} color="#4f46e5" />
        <Text className="text-xs font-bold text-indigo-700 mt-1">
          {item.startTime}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-800 mb-1">
          {getSubjectLabel(item.subject)}
        </Text>
        <Text className="text-sm text-slate-500">
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
      </View>
    </View>
  );
}
