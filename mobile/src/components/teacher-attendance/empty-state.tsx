import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function AttendanceEmptyState({
  icon,
  message,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
}) {
  return (
    <View className="flex-1 items-center justify-center pb-20">
      <Ionicons name={icon} size={64} color="#cbd5e1" />
      <Text className="mt-4 text-center text-lg text-slate-500">{message}</Text>
    </View>
  );
}
