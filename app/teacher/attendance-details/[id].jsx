import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

const AttendanceDetails = () => {
  const { student } = useLocalSearchParams();
  const parsedStudent = JSON.parse(student);

  // Function to format date in a readable format like "July 9, 2025"
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original if any error occurs
    }
  };

  const absenceHistory = parsedStudent.history.filter(
    (record) => record.status === "Absent"
  );

  return (
    <View style={styles.container}>
      {/* Student Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{parsedStudent.name}</Text>
        <Text style={styles.classText}>
          Class: <Text style={styles.class}>{parsedStudent.class}</Text>
        </Text>
      </View>

      {/* Absence History */}
      <Text style={styles.historyTitle}>Absence History</Text>
      {absenceHistory.length > 0 ? (
        <FlatList
          data={absenceHistory}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={styles.absentCard}>
              <Text style={styles.historyText}>{formatDate(item.date)}</Text>
              <Text style={styles.absentText}>Absent</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noAbsences}>No recorded absences</Text>
      )}
    </View>
  );
};

export default AttendanceDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  classText: {
    fontSize: 18,
    color: "#666",
  },
  class: {
    fontWeight: "bold",
    color: "#007bff",
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  absentCard: {
    backgroundColor: "#ffebee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  historyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
  },
  absentText: {
    backgroundColor: "#dc3545",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  noAbsences: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});
