import axios from "axios";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const SubjectsAdmin = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.subjects || res.data.data || [];
      setSubjects(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token && !authIsLoading) fetchSubjects();
  }, [token, authIsLoading]);

  useFocusEffect(
    useCallback(() => {
      if (token) fetchSubjects();
    }, [token])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubjects();
  };

  const deleteSubject = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this subject?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/api/subjects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setSubjects((prev) => prev.filter((s) => s.id !== id));
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete subject");
            }
          },
        },
      ]
    );
  };

  if (loading || authIsLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/(operations)/addSubject" style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add New Subject</Text>
      </Link>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.subjectItem}>
            <Text style={styles.subjectText}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(operations)/editSubject",
                    params: { id: item.id, name: item.name },
                  })
                }
                style={styles.editButton}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteSubject(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
    textAlign: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  subjectItem: {
    flexDirection: "column",
    justifyContent: "space-between",
    // alignItems: "center",
    padding: 15,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    marginBottom: 15,
  },
  subjectText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#28A745",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SubjectsAdmin;
