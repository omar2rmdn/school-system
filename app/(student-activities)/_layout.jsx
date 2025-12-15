import { Stack } from "expo-router";

const Root = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007BFF" },
        headerTitleStyle: { color: "white", fontWeight: "bold" },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Student Activities" }}
      />
      <Stack.Screen name="attendance" options={{ headerTitle: "Attendance" }} />
      <Stack.Screen
        name="monthlyGrades"
        options={{ headerTitle: "Monthly Grades" }}
      />
      <Stack.Screen
        name="finalResult"
        options={{ headerTitle: "Final Results" }}
      />
      <Stack.Screen
        name="weeklyPlan"
        options={{ headerTitle: "Weekly Plan" }}
      />
      <Stack.Screen
        name="subjectSummary"
        options={{ headerTitle: "Subject Summary" }}
      />
      <Stack.Screen name="timetable" options={{ headerTitle: "Time Table" }} />
      <Stack.Screen name="complaints" options={{ headerTitle: "Complaints" }} />
      <Stack.Screen
        name="addComplaint"
        options={{ headerTitle: "Add Complaint" }}
      />
      <Stack.Screen name="events" options={{ headerTitle: "Events" }} />
      <Stack.Screen
        name="eventDetails"
        options={{ headerTitle: "Event Details" }}
      />
    </Stack>
  );
};

export default Root;
