import "@/global.css";
import { SafeView } from "@/components/common/safe-view";
import { Stack } from "@/lib/router";
import { useAuthStore } from "@/store";
import { TransitionPresets } from "@react-navigation/stack";
import { ActivityIndicator, StatusBar, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

const queryClient = new QueryClient();

export default function RootLayout() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => !!state.session?.accessToken);

  if (!isHydrated) {
    return (
      <SafeView className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator color="#22d3ee" />
        <Text className="mt-4 text-sm text-slate-300">Loading session...</Text>
      </SafeView>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <StatusBar
            barStyle={"dark-content"}
            backgroundColor={"transparent"}
          />
          <Stack
            detachInactiveScreens
            screenOptions={{
              ...TransitionPresets.SlideFromRightIOS,
              headerShown: false,
              detachPreviousScreen: true,
            }}
          >
            <Stack.Screen name="index" />

            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name="login" />
            </Stack.Protected>

            <Stack.Protected guard={isAuthenticated}>
              <Stack.Screen name="(main)" />
              <Stack.Screen name="unauthorized" />
            </Stack.Protected>
          </Stack>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
