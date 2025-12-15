import axios from "axios";
import { router, useFocusEffect } from "expo-router";
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

const Classes = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/Classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.classes || res.data.data || [];
      setClasses(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load classes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token && !authIsLoading) fetchClasses();
  }, [token, authIsLoading]);

  useFocusEffect(
    useCallback(() => {
      if (token) fetchClasses();
    }, [token])
  );

  const deleteClass = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this class?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const classId = parseInt(id, 10);
              await axios.delete(`${API_BASE}/api/Classes/${classId}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: {},
              });
              setClasses((prev) => prev.filter((c) => c.id !== id));
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete class");
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(operations)/addClass")}
      >
        <Text style={styles.addButtonText}>+ Add New Class</Text>
      </TouchableOpacity>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.classItem}>
            <Text style={styles.classText}>{item.name || item.className}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: "/(operations)/editClass",
                    params: { id: item.id, name: item.name || item.className },
                  })
                }
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteClass(item.id)}
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
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  classItem: {
    flexDirection: "column",
    justifyContent: "space-between",
    // alignItems: "center",
    padding: 15,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    marginBottom: 15,
  },
  classText: {
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
  center: { justifyContent: "center", alignItems: "center" },
});

export default Classes;
