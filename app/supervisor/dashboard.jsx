import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SupervisorDashboard = () => {
  // Pre-define navigation handlers to avoid inline functions
  const navigateToComplaints = () => {
    router.push("/supervisor/complaintsTypes");
  };

  const navigateToAttendance = () => {
    router.push("/supervisor/attendance");
  };

  return (
    <View style={styles.container}>
      {/* Complaints Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={navigateToComplaints}
      >
        <Text style={styles.cardTitle}>Complaints</Text>
        <Text style={styles.cardDescription}>
          View and manage student complaints.
        </Text>
      </TouchableOpacity>

      {/* Attendance Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={navigateToAttendance}
      >
        <Text style={styles.cardTitle}>Attendance</Text>
        <Text style={styles.cardDescription}>
          Monitor and update student attendance.
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SupervisorDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: "#666",
  },
});
