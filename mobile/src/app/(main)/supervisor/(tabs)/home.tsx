import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { SafeView } from "@/components/common/safe-view";
import WelcomeCard from "@/components/common/welcome-card";
import { DashboardList } from "@/components/cards/dashboard-list";

const supervisorItems = [
  {
    id: 1,
    title: "Complaints",
    icon: "chatbox-ellipses",
    description: "Send complaints and review parent complaints.",
    color: "text-amber-600",
    bg: "bg-amber-100",
    path: "/(main)/supervisor/dashboard/complaints",
  },
];

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
        <WelcomeCard fallback="Supervisor" />

        <View className="px-4">
          <DashboardList variant="menu" items={supervisorItems} onPress={handleCardPress} />
        </View>
      </ScrollView>
    </SafeView>
  );
}
