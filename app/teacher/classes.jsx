import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const Classes = () => {
  const { token } = useAuth();
  const { subjectId, subjectName } = useLocalSearchParams();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/Teachers/subjects/${subjectId}/classes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        const mapped = data.map((c) => ({
          id: c.id || c.classId,
          name: c.name || c.className,
        }));
        setClasses(mapped);
      } catch (err) {
        console.error("FETCH-TEACHER-CLASSES", err);
        setError("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };
    if (token && subjectId) fetchClasses();
  }, [token, subjectId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {classes.map((cls) => (
        <TouchableOpacity
          key={cls.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/teacher/classDetails",
              params: { id: cls.id, name: cls.name, subjectId },
            })
          }
        >
          <Text style={styles.className}>{cls.name}</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="black" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Classes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
  className: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
