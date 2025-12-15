import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

export default function StudentDetails() {
  const params = useLocalSearchParams();
  const student = params.student ? JSON.parse(params.student) : null;
  const { token } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentSubjects = async () => {
      if (!student?.id || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${API_BASE}/api/students/student/${student.id}/subjects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const subjectsData = Array.isArray(res.data)
          ? res.data
          : res.data.subjects || res.data.items || res.data.data || [];

        const processedSubjects = subjectsData.map((s) => ({
          id: s.id || s.subjectId,
          name: s.name || s.subjectName || s.title || "",
        }));

        setSubjects(processedSubjects);
      } catch (err) {
        console.error("FETCH-STUDENT-SUBJECTS", err);
        setError("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentSubjects();
  }, [student?.id, token]);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Student data not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Student Image */}
      <Image
        source={
          student.image
            ? { uri: student.image }
            : require("../../assets/images/splash-icon.png")
        }
        style={styles.studentImage}
      />

      {/* Student Name */}
      <Text style={styles.studentName}>{student.name}</Text>

      {/* Level */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Level:</Text>
        <Text style={styles.infoText}>{student.levelName || "N/A"}</Text>
      </View>

      {/* Class */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Class:</Text>
        <Text style={styles.infoText}>{student.className || "N/A"}</Text>
      </View>

      {/* Subjects */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Subjects:</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Loading subjects...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.infoText}>
            {subjects.length > 0
              ? subjects.map((s) => s.name).join(", ")
              : "No subjects assigned"}
          </Text>
        )}
      </View>

      {/* Parent Information */}
      {student.parentName && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Parent:</Text>
          <Text style={styles.infoText}>{student.parentName}</Text>
        </View>
      )}
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
  studentImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    marginBottom: 15,
  },
  studentName: {
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
