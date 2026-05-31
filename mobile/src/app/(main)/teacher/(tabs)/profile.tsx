import { Text, View, Pressable } from "react-native";
import React from "react";
import { SafeView } from "@/components/common/safe-view";
import { useAuthStore } from "@/store";
import { router } from "expo-router";

export default function Profile() {
  const { session, logout } = useAuthStore();
  const user = session?.user;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <SafeView className="flex-1 bg-gray-50 px-6 pt-10">
      <View className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <View className="items-center mb-6">
          <View className="h-20 w-20 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-blue-600 uppercase">
              {user?.firstName?.[0] || ""}
              {user?.lastName?.[0] || ""}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-sm text-gray-500 capitalize">{user?.role}</Text>
        </View>

        <View>
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Email
            </Text>
            <Text className="text-base text-gray-900">{user?.email}</Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Phone
            </Text>
            <Text className="text-base text-gray-900">
              {user?.phone || "N/A"}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        className="w-full bg-red-50 items-center justify-center rounded-lg py-4 border border-red-200"
      >
        <Text className="text-base font-semibold text-red-600">Log Out</Text>
      </Pressable>
    </SafeView>
  );
}
