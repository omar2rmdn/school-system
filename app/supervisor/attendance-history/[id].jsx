import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../../context/AuthContext";

const AttendanceHistory = () => {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format date in a readable format like "July 9, 2025"
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString; // Return original if any error occurs
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/api/attandances/student/${id}/recorded-attendance`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const absentRecs = (res.data.attendanceRecords || []).filter(
        (r) => !r.isPresent
      );
      setRecords(absentRecs);
    } catch (err) {
      console.error("FETCH-ATT-HISTORY", err.response?.data || err.message);
      setError("Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) fetchHistory();
  }, [token, id]);

  const deleteRecord = async (recordId) => {
    Alert.alert("Confirm", "Delete this absence record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/api/attandances/${recordId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setRecords((prev) => prev.filter((r) => r.id !== recordId));
          } catch (err) {
            console.error("DELETE-ATT", err.response?.data || err.message);
            Alert.alert("Error", "Failed to delete record");
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No absence records found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteRecord(item.id)}
            >
              <Text style={{ color: "#fff" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default AttendanceHistory;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  date: { fontWeight: "bold", fontSize: 16 },
  deleteBtn: { backgroundColor: "#dc3545", padding: 10, borderRadius: 6 },
});
