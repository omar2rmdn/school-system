import { Stack } from "expo-router";
import { AdminDataProvider } from "../../context/AdminDataContext";

export default function OperationsLayout() {
  // dvspmvsd
  return (
    <AdminDataProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#007BFF" },
          headerTitleStyle: { color: "white", fontWeight: "bold" },
          headerTintColor: "white",
        }}
      >
        <Stack.Screen name="addClass" options={{ headerTitle: "Add Class" }} />
        <Stack.Screen name="editClass" options={{ headerTitle: "Edit Class" }} />
        <Stack.Screen
          name="addSubject"
          options={{ headerTitle: "Add Subject" }}
        />
        <Stack.Screen
          name="editSubject"
          options={{ headerTitle: "Edit Subject" }}
        />
        <Stack.Screen
          name="addTeacher"
          options={{ headerTitle: "Add Teacher" }}
        />
        <Stack.Screen
          name="editTeacher"
          options={{ headerTitle: "Edit Teacher" }}
        />
        <Stack.Screen
          name="assignTeacherClass"
          options={{ headerTitle: "Assign Class" }}
        />
        <Stack.Screen
          name="assignTeacherSubject"
          options={{ headerTitle: "Assign Subject" }}
        />
        <Stack.Screen name="addParent" options={{ headerTitle: "Add Parent" }} />
        <Stack.Screen
          name="editParent"
          options={{ headerTitle: "Edit Parent" }}
        />
        <Stack.Screen
          name="addStudent"
          options={{ headerTitle: "Add Student" }}
        />
        <Stack.Screen
          name="editStudent"
          options={{ headerTitle: "Edit Student" }}
        />
        <Stack.Screen
          name="addSupervisor"
          options={{ headerTitle: "Add Supervisor" }}
        />
        <Stack.Screen
          name="editSupervisor"
          options={{ headerTitle: "Edit Supervisor" }}
        />
        <Stack.Screen name="addAdmin" options={{ headerTitle: "Add Admin" }} />
        <Stack.Screen name="editAdmin" options={{ headerTitle: "Edit Admin" }} />
        <Stack.Screen
          name="assignStudentSubject"
          options={{ headerTitle: "Assign Subject" }}
        />
        <Stack.Screen name="addEvents" options={{ headerTitle: "Add Event" }} />
        <Stack.Screen name="editEvent" options={{ headerTitle: "Edit Event" }} />
        <Stack.Screen name="addNews" options={{ headerTitle: "Add News" }} />
        <Stack.Screen name="editNews" options={{ headerTitle: "Edit News" }} />
        <Stack.Screen name="gallery" options={{ headerTitle: "Gallery" }} />
        <Stack.Screen
          name="timetable/[className]"
          options={{ headerTitle: "Timetable" }}
        />
      </Stack>
    </AdminDataProvider>
  );
}
