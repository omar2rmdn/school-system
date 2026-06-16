import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Attendance } from "@/types";
import { getStatusColor, getStatusIcon } from "@/utils";

interface AttendanceItemProps {
  item: Attendance;
}

export function AttendanceItem({ item }: AttendanceItemProps) {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100 flex-row items-center">
      <View
        className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
          getStatusColor(item.status).split(" ")[1]
        }`}
      >
        <Ionicons
          name={getStatusIcon(item.status)}
          size={24}
          className={getStatusColor(item.status).split(" ")[0]}
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-800 capitalize mb-1">
          {item.status}
        </Text>
        <Text className="text-sm text-slate-500">
          {new Date(item.date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
    </View>
  );
}
