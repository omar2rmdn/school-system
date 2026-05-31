import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { SafeView } from "@/components/common/safe-view";
import WelcomeCard from "@/components/common/welcome-card";

export default function Home() {
  return (
    <SafeView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <WelcomeCard fallback="Supervisor" />

        <View className="px-4">
          <View className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <TouchableOpacity
              onPress={() => router.push("/(main)/supervisor/dashboard/complaints" as Href)}
              className="flex-row items-center p-4"
              activeOpacity={0.7}
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Ionicons name="chatbox-ellipses" size={24} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 text-lg font-bold text-slate-800">
                  Complaints
                </Text>
                <Text className="text-sm text-slate-500">
                  Send complaints and review parent complaints.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeView>
  );
}
