import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

const TeachersScreen = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const parseTeacher = (t) => ({
    id: t.id || t.teacherId,
    firstName: t.firstName || t.name?.split(" ")[0] || "",
    lastName: t.lastName || t.name?.split(" ").slice(1).join(" ") || "",
    email: t.email,
    nationalID: t.nationalID || t.nationalId,
    image:
      (t.image || t.imageUrl) && !(t.image || t.imageUrl).startsWith("http")
        ? `${API_BASE}/${t.image || t.imageUrl}`
        : t.image || t.imageUrl,
    subjects: t.subjects || [],
  });

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        setFilteredTeachers(teachers);
      } else {
        const filtered = teachers.filter((teacher) => {
          const fullName = `${teacher.firstName} ${teacher.lastName}`.trim();
          return (
            fullName.toLowerCase().includes(query.toLowerCase()) ||
            teacher.email.toLowerCase().includes(query.toLowerCase()) ||
            (teacher.nationalID &&
              teacher.nationalID.toLowerCase().includes(query.toLowerCase()))
          );
        });
        setFilteredTeachers(filtered);
      }
    },
    [teachers]
  );

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataRaw = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.teachers || res.data.data || [];

      const teachersParsed = dataRaw.map(parseTeacher);
      teachersParsed.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setTeachers(teachersParsed);
      setFilteredTeachers(teachersParsed);
    } catch (err) {
      console.error(err);
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token && !authIsLoading) fetchTeachers();
  }, [token, authIsLoading]);

  useFocusEffect(
    useCallback(() => {
      if (token) fetchTeachers();
    }, [token])
  );

  const deleteTeacher = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this teacher?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/api/teachers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: {},
              });
              setTeachers((prev) => prev.filter((t) => t.id !== id));
              setFilteredTeachers((prev) => prev.filter((t) => t.id !== id));
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete teacher");
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
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
        onPress={() => router.push("/(operations)/addTeacher")}
      >
        <Text style={styles.addButtonText}>+ Add New Teacher</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or national ID"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={filteredTeachers}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              style={styles.cardHeader}
              onPress={() =>
                router.push({
                  pathname: "/(operations)/teacherDetails",
                  params: { teacher: JSON.stringify(item) },
                })
              }
            >
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require("../../assets/splash-icon.png")
                }
                style={styles.cardImage}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.cardEmail}>{item.email}</Text>
              </View>
            </Pressable>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.assignButton}
                onPress={() =>
                  router.push({
                    pathname: "/(operations)/assignTeacherClass",
                    params: { teacher: JSON.stringify(item) },
                  })
                }
              >
                <Text style={styles.buttonText}>Assign Class</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.assignButton}
                onPress={() =>
                  router.push({
                    pathname: "/(operations)/assignTeacherSubject",
                    params: { teacher: JSON.stringify(item) },
                  })
                }
              >
                <Text style={styles.buttonText}>Assign Subject</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: "/(operations)/editTeacher",
                    params: { teacher: JSON.stringify(item) },
                  })
                }
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTeacher(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardEmail: {
    fontSize: 14,
    color: "#555",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
    marginTop: 10,
  },
  assignButton: {
    backgroundColor: "#28A745",
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#FFC107",
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default TeachersScreen;
