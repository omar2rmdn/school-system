import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const activities = [
  { id: 1, name: "Students Attendance", path: "attendance" },
  { id: 2, name: "Final Exam Grading", path: "final" },
  { id: 3, name: "Monthly Rates", path: "monthlyRates" },
  { id: 4, name: "Weekly Plan", path: "weeklyPlan" },
];

const TeacherClassDetails = () => {
  const { id: classId, subjectId } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      {activities.map((activity) => (
        <TouchableOpacity
          key={activity.id}
          style={styles.card}
          onPress={() => router.push({ pathname: `/teacher/${activity.path}`, params: { classId, subjectId } })}
        >
          <Text style={styles.activityName}>{activity.name}</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="black" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TeacherClassDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  activityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
