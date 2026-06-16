import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppEvent } from "@/types";

interface EventItemProps {
  item: AppEvent;
}

export function EventItem({ item }: EventItemProps) {
  return (
    <View className="p-4 mb-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3">
          <Ionicons name="calendar" size={20} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{item.title}</Text>
          {item.date && (
            <Text className="text-sm text-gray-500">
              {new Date(item.date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <Text className="text-base text-gray-700 mt-2">{item.description}</Text>
      {item.location && (
        <View className="flex-row items-center mt-3">
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-500 ml-1">{item.location}</Text>
        </View>
      )}
    </View>
  );
}
