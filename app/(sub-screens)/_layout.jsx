import { Stack } from "expo-router";

const Root = () => {
  return (
    <Stack>
      <Stack.Screen
        name="about"
        options={{
          headerTitle: "About Us",
          headerStyle: { backgroundColor: "#007BFF" },
          headerTitleStyle: { color: "white", fontWeight: "bold" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="activities"
        options={{
          headerTitle: "Activities",
          headerStyle: { backgroundColor: "#007BFF" },
          headerTitleStyle: { color: "white", fontWeight: "bold" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="news"
        options={{
          headerTitle: "News",
          headerStyle: { backgroundColor: "#007BFF" },
          headerTitleStyle: { color: "white", fontWeight: "bold" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="newsDetails"
        options={{
          headerTitle: "Details",
          headerStyle: { backgroundColor: "#007BFF" },
          headerTitleStyle: { color: "white", fontWeight: "bold" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="activity/[id]"
        options={{
          headerTitle: "Details",
          headerStyle: { backgroundColor: "#007BFF" },
          headerTitleStyle: { color: "white", fontWeight: "bold" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          headerTitle: "Dashboard",
          headerStyle: { backgroundColor: "#007BFF" },
          headerTitleStyle: { color: "white", fontWeight: "bold" },
          headerTintColor: "white",
        }}
      />
    </Stack>
  );
};

export default Root;
