import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "https://edu-spring.runasp.net";

export default function TeacherDetails() {
  const params = useLocalSearchParams();
  const teacher = params.teacher ? JSON.parse(params.teacher) : null;
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!teacher) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Teacher data not found</Text>
      </View>
    );
  }

  // Get teacher's subjects from the teacher object
  const getTeacherSubjects = () => {
    if (teacher.subjects && teacher.subjects.length > 0) {
      return teacher.subjects;
    }
    return [];
  };

  const teacherSubjects = getTeacherSubjects();

  return (
    <View style={styles.container}>
      {/* Teacher Image */}
      <Image
        source={
          teacher.image
            ? { uri: teacher.image }
            : require("../../assets/images/splash-icon.png")
        }
        style={styles.teacherImage}
      />

      {/* Teacher Name */}
      <Text style={styles.teacherName}>
        {teacher.firstName} {teacher.lastName}
      </Text>

      {/* Email */}
      {teacher.email && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Email:</Text>
          <Text style={styles.infoText}>{teacher.email}</Text>
        </View>
      )}

      {/* National ID */}
      {teacher.nationalID && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>National ID:</Text>
          <Text style={styles.infoText}>{teacher.nationalID}</Text>
        </View>
      )}

      {/* Assigned Subjects */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Subjects:</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.infoText}>
            {teacherSubjects.length > 0 
              ? (typeof teacherSubjects[0] === 'string' 
                  ? teacherSubjects.join(", ") 
                  : teacherSubjects.map(s => s.name || s.subjectName || s.title).join(", "))
              : "No subjects assigned"}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  teacherImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    marginBottom: 15,
  },
  teacherName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoContainer: {
    width: "100%",
    padding: 15,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 14,
    color: "#ff0000",
  },
});
