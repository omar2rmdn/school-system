import { Stack } from "expo-router";

const Dashboard = () => {
  return (
    <Stack
    screenOptions={{
      statusBarStyle: "dark",
      headerStyle: { backgroundColor: "#007BFF" },
      headerTitleStyle: { color: "white", fontWeight: "bold" },
      headerTintColor: "white",
    }}
    >
      <Stack.Screen name="dashboard" options={{ headerTitle: "Dashboard" }} />
      <Stack.Screen
        name="complaintsTypes"
        options={{ headerTitle: "Compliants Types" }}
      />
      <Stack.Screen
        name="sendComplaint"
        options={{ headerTitle: "Send Complaint" }}
      />
      <Stack.Screen
        name="complaintForm"
        options={{ headerTitle: "Complaint Form" }}
      />
      <Stack.Screen
        name="recievedComplaints"
        options={{ headerTitle: "Recieved Complaints" }}
      />
      <Stack.Screen
        name="complaint-details/[id]"
        options={{ headerTitle: "Details" }}
      />
      <Stack.Screen
        name="attendance-history/[id]"
        options={{ headerTitle: "Attendance History" }}
      />
      <Stack.Screen
        name="attendance"
        options={{ headerTitle: "Attendance" }}
      />
    </Stack>
  );
};

export default Dashboard;
