import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { API_BASE } from "../../context/AuthContext";

const activities = [
  {
    name: "Monthly Grades",
    icon: <MaterialIcons name="assessment" size={40} color="#007BFF" />,
    path: "monthlyGrades",
  },
  {
    name: "Final Results",
    icon: (
      <MaterialCommunityIcons
        name="clipboard-text-multiple"
        size={40}
        color="#007BFF"
      />
    ),
    path: "finalResult",
  },
  {
    name: "Weekly Plan",
    icon: <Entypo name="calendar" size={40} color="#007BFF" />,
    path: "weeklyPlan",
  },
  {
    name: "Subject Summary",
    icon: <FontAwesome name="file-text-o" size={40} color="#007BFF" />,
    path: "subjectSummary",
  },
  {
    name: "Time Table",
    icon: <MaterialIcons name="date-range" size={40} color="#007BFF" />,
    path: "timetable",
  },
  {
    name: "Attendance",
    icon: <FontAwesome6 name="list-check" size={40} color="#007BFF" />,
    path: "attendance",
  },
  {
    name: "Complaints",
    icon: <AntDesign name="exclamationcircle" size={40} color="#007BFF" />,
    path: "complaints",
  },
  {
    name: "Events",
    icon: <Entypo name="megaphone" size={40} color="#007BFF" />,
    path: "events",
  },
];

const StudentActivitiesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const studentId = params.studentId;
  const studentName = params.studentName;

  const handlePress = async (activityPath) => {
    if (activityPath === "weeklyPlan") {
      try {
        const res = await axios.get(
          `${API_BASE}/api/students/student/${studentId}/subjects`
        );
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        if (data.length === 0) {
          return Alert.alert("No Data", "No subjects found for this student");
        }
        const first = data[0] || {};
        const subjKey = Object.keys(first).find(
          (k) =>
            k.toLowerCase().includes("subject") &&
            k.toLowerCase().endsWith("id")
        );
        const clsKey = Object.keys(first).find(
          (k) =>
            k.toLowerCase().includes("class") && k.toLowerCase().endsWith("id")
        );
        const subjectId = first[subjKey]?.toString() || "";
        const classId = first[clsKey]?.toString() || "";
        router.push({
          pathname: `/(student-activities)/weeklyPlan`,
          params: { studentId, studentName, subjectId, classId },
        });
      } catch (err) {
        console.error("FETCH-STU-SUBJECTS", err.response?.data || err.message);
        Alert.alert("Error", "Failed to load weekly plan");
      }
    } else {
      router.push({
        pathname: `/(student-activities)/${activityPath}`,
        params: { studentId, studentName },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {activities.map((activity, index) => (
          <Pressable
            key={index}
            style={styles.card}
            onPress={() => handlePress(activity.path)}
          >
            <Text style={styles.cardIcon}>{activity.icon}</Text>
            <Text style={styles.cardText}>{activity.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default StudentActivitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
    alignItems: "center",
  },
  cardsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  cardIcon: {
    fontSize: 30,
  },
  cardText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
