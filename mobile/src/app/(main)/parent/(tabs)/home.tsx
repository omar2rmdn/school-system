import { ScrollView, View } from "react-native";
import React, { useRef, useState } from "react";
import { SafeView } from "@/components/common/safe-view";
import WelcomeCard from "@/components/common/welcome-card";
import { BottomSheetMethods } from "@/components/templates/bottom-sheet/types";
import { parentItems } from "@/consts";
import { StudentSelectionSheet } from "@/components/sheets/student-selection-sheet";
import { DashboardList } from "@/components/cards/dashboard-list";
import { Href, router } from "expo-router";

export default function Home() {
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleCardPress = (path: string) => {
    if (path === "/parent/dashboard/events") {
      router.push(path as Href);
    } else {
      setSelectedPath(path);
      bottomSheetRef.current?.snapToIndex(0);
    }
  };

  const handleStudentSelected = () => {
    if (selectedPath) {
      setTimeout(() => {
        router.push(selectedPath as Href);
      }, 50);
    }
  };

  return (
    <SafeView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <WelcomeCard fallback="Parent" />

        <View className="px-4">
          <DashboardList variant="menu" items={[...parentItems]} onPress={handleCardPress} />
        </View>
      </ScrollView>

      <StudentSelectionSheet
        ref={bottomSheetRef}
        onSelect={handleStudentSelected}
      />
    </SafeView>
  );
}
