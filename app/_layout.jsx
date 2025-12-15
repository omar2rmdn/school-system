import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import "../css/global.css";
// Import global text defaults to ensure consistent rendering
import { StatusBar } from "expo-status-bar";
import "../components/GlobalTextDefaults";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Authentication Screens */}
        <Stack.Screen name="(auth)/login" />

        {/* Main Tab Navigator */}
        <Stack.Screen
          name="(tabs)"
          options={{
            title: "Home",
          }}
        />
        <Stack.Screen
          name="supervisor"
          options={{
            headerShown: false,
            title: "Home",
          }}
        />

        {/* Sub-screens */}
        <Stack.Screen
          name="(sub-screens)/about"
          options={{
            title: "About Us",
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="(sub-screens)/news"
          options={{
            title: "News",
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="(sub-screens)/activities"
          options={{
            title: "Activities",
            headerTintColor: "white",
          }}
        />

        {/* Other Screens */}
        <Stack.Screen
          name="unauthorized"
          options={{
            title: "Access Denied",
            headerTintColor: "white",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
