import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeView } from "@/components/common/safe-view";
import { useEvents } from "@/queries/events";
import { AppEvent } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DashboardList } from "@/components/cards/dashboard-list";

export default function Events() {
  const { data: events, isLoading, isError } = useEvents();

  const renderEvent = ({ item }: { item: AppEvent }) => (
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

  return (
    <SafeView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Events</Text>
      </View>

      <DashboardList
        variant="list"
        data={events ?? []}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        isLoading={isLoading}
        loadingColor="#10b981"
        emptyIcon="calendar-outline"
        emptyMessage="No events found."
        error={isError ? "Failed to load events" : null}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 0 }}
      />
    </SafeView>
  );
}
