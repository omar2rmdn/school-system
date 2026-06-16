import React from "react";
import { View, Text } from "react-native";
import { SafeView } from "@/components/common/safe-view";
import { useEvents } from "@/queries/events";
import { DashboardList } from "@/components/cards/dashboard-list";
import { EventItem } from "@/components/list-items";

export default function Events() {
  const { data: events, isLoading, isError } = useEvents();

  return (
    <SafeView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Events</Text>
      </View>

      <DashboardList
        variant="list"
        data={events ?? []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EventItem item={item} />}
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
