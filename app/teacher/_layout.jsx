import { Stack } from "expo-router";

function Root() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007BFF" },
        headerTitleStyle: { color: "white", fontWeight: "bold" },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: "Subjects" }} />
      <Stack.Screen name="classes" options={{ headerTitle: "Classes" }} />
      <Stack.Screen
        name="classDetails"
        options={{ headerTitle: "Class Details" }}
      />
      <Stack.Screen name="attendance" options={{ headerTitle: "Attendance" }} />
      <Stack.Screen
        name="attendance-details/[id]"
        options={{ headerTitle: "Attendance Details" }}
      />
      <Stack.Screen name="final" options={{ headerTitle: "Final Grades" }} />
      <Stack.Screen
        name="monthlyRates"
        options={{ headerTitle: "Monthly Rates" }}
      />
      <Stack.Screen
        name="weeklyPlan"
        options={{ headerTitle: "Weekly Plan" }}
      />
    </Stack>
  );
}

export default Root;
