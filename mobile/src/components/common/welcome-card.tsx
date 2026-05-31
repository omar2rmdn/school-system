import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store";

interface Props {
  fallback?: string;
}

export default function WelcomeCard({ fallback = "User" }: Props) {
  const session = useAuthStore((state) => state.session);
  const user = session?.user;

  return (
    <View className="px-4 pt-6 pb-4">
      <View className="relative bg-emerald-800 p-8 rounded-xl shadow-md overflow-hidden">
        {/* Floating Background Icon */}
        <View className="absolute -right-6 -bottom-6 opacity-10">
          <Ionicons name="school" size={160} color="white" />
        </View>

        <View className="relative z-10">
          <Text className="text-emerald-100 text-sm font-medium mb-2 tracking-wide uppercase">
            Welcome back
          </Text>
          <Text
            className="text-3xl font-extrabold text-white"
            numberOfLines={1}
          >
            {user ? `${user.firstName} ${user.lastName}` : fallback}
          </Text>
        </View>
      </View>
    </View>
  );
}
