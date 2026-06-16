import { ScrollView, View } from "react-native";
import React from "react";
import { SafeView } from "@/components/common/safe-view";
import WelcomeCard from "@/components/common/welcome-card";
import { teacherItems } from "@/consts";
import { DashboardList } from "@/components/cards/dashboard-list";
import { Href, router } from "expo-router";

export default function Home() {
  const handleCardPress = (path: string) => {
    router.push(path as Href);
  };

  return (
    <SafeView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <WelcomeCard fallback="Teacher" />

        <View className="px-4">
          <DashboardList variant="menu" items={[...teacherItems]} onPress={handleCardPress} />
        </View>
      </ScrollView>
    </SafeView>
  );
}
