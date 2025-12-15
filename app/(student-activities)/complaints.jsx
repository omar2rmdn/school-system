import axios from "axios";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const ComplaintsPage = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const paramsRouter = useLocalSearchParams();
  const studentIdParam = paramsRouter.studentId;
  const studentNameParam = paramsRouter.studentName;
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Function to get status styling based on status value
  const getStatusStyle = (status) => {
    switch (status) {
      case "New":
        return { backgroundColor: "#ff9800" }; // Orange
      case "InReview":
        return { backgroundColor: "#2196f3" }; // Blue
      case "Responded":
        return { backgroundColor: "#4caf50" }; // Green
      case "Closed":
        return { backgroundColor: "#9e9e9e" }; // Gray
      default:
        return { backgroundColor: "#ff9800" }; // Default orange
    }
  };

  const fetchComplaints = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.data || [];
      const mapped = data.map((c) => ({
        id: c.id?.toString() ?? "",
        studentName: c.studentName || c.name,
        description: c.description,
        status: c.status || "New",
        image:
          (c.image || c.imageUrl) && !(c.image || c.imageUrl).startsWith("http")
            ? `${API_BASE}/${c.image || c.imageUrl}`
            : c.image || c.imageUrl || "https://via.placeholder.com/100",
        date:
          c.date || new Date(c.createdAt || c.createdDate).toLocaleDateString(),
      }));
      setComplaints(mapped);
    } catch (err) {
      console.error("FETCH-COMPLAINTS error", err);
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
  };

  if (loading || authIsLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaints Archive</Text>

      {/* Complaints List */}
      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.complaintCard}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.name}>{item.studentName}</Text>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: "/(student-activities)/addComplaint",
            params: {
              studentId: studentIdParam,
              studentName: studentNameParam,
            },
          })
        }
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ComplaintsPage;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  // Complaint Card
  complaintCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  image: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  textContainer: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: "bold", flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  date: { fontSize: 14, color: "#888", marginBottom: 4, marginTop: 8 },
  description: { fontSize: 14, color: "#555" },

  // Floating Add Button
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  addButtonText: { fontSize: 30, color: "#fff", fontWeight: "bold" },
});
