import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const TeacherDashboard = () => {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/Teachers/subjects/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        const mapped = data.map((s) => ({
          id: s.id || s.subjectId,
          name: s.name || s.title,
        }));
        setSubjects(mapped);
      } catch (err) {
        console.error("FETCH-TEACHER-SUBJECTS", err);
        setError("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSubjects();
  }, [token]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        subjects.map((subject) => (
          <TouchableOpacity
            key={subject.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/teacher/classes",
                params: { subjectId: subject.id, subjectName: subject.name },
              })
            }
          >
            <Text style={styles.subjectName}>{subject.name}</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={28}
              color="black"
            />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default TeacherDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
