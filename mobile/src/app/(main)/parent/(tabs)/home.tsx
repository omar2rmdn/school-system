import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import { SafeView } from "@/components/common/safe-view";
import WelcomeCard from "@/components/common/welcome-card";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetMethods } from "@/components/templates/bottom-sheet/types";
import { parentItems } from "@/consts";
import { StudentSelectionSheet } from "@/components/sheets/student-selection-sheet";
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
          <View className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {parentItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCardPress(item.path)}
                className={`flex-row items-center p-4 ${
                  index !== parentItems.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }`}
                activeOpacity={0.7}
              >
                <View
                  className={`w-12 h-12 rounded-full ${item.bg} items-center justify-center mr-4`}
                >
                  <Ionicons name={item.icon} size={24} className={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-slate-800 mb-0.5">
                    {item.title}
                  </Text>
                  <Text className="text-sm text-slate-500">
                    {item.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <StudentSelectionSheet
        ref={bottomSheetRef}
        onSelect={handleStudentSelected}
      />
    </SafeView>
  );
}
