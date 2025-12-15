import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const Students = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/Students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { pageNumber: 1, pageSize: 1000 },
      });

      const data = res.data;
      const items = Array.isArray(data) ? data : data.items || data.data || [];

      const parsed = items.map((s) => ({
        id: s.id?.toString() ?? "",
        name: s.name,
        levelName: s.levelName,
        className: s.className,
        parentName: s.parentName,
        parentId: s.parentId,
        parentNationalId: s.parentNationalId || s.parentNationalID || "",
        image: s.image
          ? `${API_BASE}/${s.image}`
          : "https://via.placeholder.com/100",
      }));

      const sortedStudents = parsed.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setStudents(sortedStudents);
      setFilteredStudents(sortedStudents);
    } catch (err) {
      console.error("FETCH-STUDENTS error", err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        setFilteredStudents(students);
      } else {
        const filtered = students.filter(
          (student) =>
            student.name.toLowerCase().includes(query.toLowerCase()) ||
            student.levelName.toLowerCase().includes(query.toLowerCase()) ||
            student.className.toLowerCase().includes(query.toLowerCase()) ||
            student.parentName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredStudents(filtered);
      }
    },
    [students]
  );

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [fetchStudents])
  );

  const deleteStudent = async (id) => {
    Alert.alert("Confirm Deletion", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/api/Students/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchStudents();
          } catch (err) {
            console.error("DELETE-STUDENT error", err);
            Alert.alert("Error", "Failed to delete student");
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(operations)/addStudent")}
      >
        <Text style={styles.addButtonText}>+ Add New Student</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, level, class, or parent"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#666"
        />
      </View>

      {loading && students.length === 0 ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={styles.center}>
          <Text>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.cardHeader}
                onPress={() =>
                  router.push({
                    pathname: "/(operations)/studentDetails",
                    params: { student: JSON.stringify(item) },
                  })
                }
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    {capitalizeFirstLetter(item.name)} {item.parentName}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    {item.levelName} - Class {item.className}
                  </Text>
                </View>
              </Pressable>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    router.push({
                      pathname: "/(operations)/editStudent",
                      params: { student: JSON.stringify(item) },
                    })
                  }
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() =>
                    router.push({
                      pathname: "/(operations)/assignStudentSubject",
                      params: { student: JSON.stringify(item) },
                    })
                  }
                >
                  <Text style={styles.buttonText}>Subjects</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteStudent(item.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#333",
    fontFamily: "System",
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    marginRight: 15,
  },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 14, color: "#6B7280" },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  editButton: {
    backgroundColor: "#FBBF24",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  assignButton: {
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});

export default Students;
