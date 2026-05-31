import { Image } from "expo-image";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("@/assets/icons/home-active.png")
                  : require("@/assets/icons/home-inactive.png")
              }
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("@/assets/icons/profile-active.png")
                  : require("@/assets/icons/profile-inactive.png")
              }
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
