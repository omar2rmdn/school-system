import { SafeView } from "@/components/common/safe-view";
import { useAuthStore } from "@/store";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Unauthorized() {
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeView className="flex-1 bg-slate-950 px-6">
      <View className="flex-1 items-center justify-center">
        <View className="w-full max-w-sm rounded-3xl border border-amber-400/20 bg-slate-900 p-6">
          <Text className="text-2xl font-bold text-white">Access blocked</Text>
          <Text className="mt-3 text-base leading-6 text-slate-300">
            {session?.user.role
              ? `The ${session.user.role} role does not have a mobile dashboard configured yet.`
              : "Your account does not have access to this section."}
          </Text>

          <Pressable
            onPress={() => {
              logout();
              router.replace("/login");
            }}
            className="mt-6 items-center rounded-2xl bg-cyan-500 px-4 py-4"
          >
            <Text className="text-base font-semibold text-slate-950">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeView>
  );
}
