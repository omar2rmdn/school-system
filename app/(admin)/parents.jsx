import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const ParentsAdmin = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        setFilteredParents(parents);
      } else {
        const filtered = parents.filter(
          (parent) =>
            parent.name.toLowerCase().includes(query.toLowerCase()) ||
            parent.email.toLowerCase().includes(query.toLowerCase()) ||
            parent.nationalID.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredParents(filtered);
      }
    },
    [parents]
  );

  const fetchParents = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE}/api/Users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pageNumber: 1,
          pageSize: 1000,
          role: "Parent",
        },
      });

      const data = res.data;
      const items = Array.isArray(data) ? data : data.items || data.data || [];

      const parentsOnly = items.filter(
        (u) => u.roles && u.roles.includes("Parent")
      );

      const parentsData = parentsOnly
        .map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          name: `${u.firstName} ${u.lastName}`.trim(),
          email: u.email,
          nationalID: u.nationalID,
          image:
            u.image && !u.image.startsWith("http")
              ? `${API_BASE}/${u.image}`
              : u.image,
          isDisabled: u.isDisabled ?? false,
        }))
        .filter((u) => !u.isDisabled)
        .sort((a, b) => a.name.localeCompare(b.name));

      setParents(parentsData);
      setFilteredParents(parentsData);
    } catch (err) {
      console.error("FETCH-PARENTS error", err);
      setError("Failed to load parents");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchParents();
    }, [fetchParents])
  );

  const disableParent = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/Users/${id}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchParents();
    } catch (err) {
      console.error("DISABLE-PARENT error", err);
      Alert.alert("Error", "Failed to disable parent");
    }
  };

  const handleDisablePress = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this parent?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => disableParent(id),
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchParents();
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
        onPress={() => router.push("/(operations)/addParent")}
      >
        <Text style={styles.addButtonText}>+ Add New Parent</Text>
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
        data={filteredParents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image
                source={{
                  uri: item.image || "https://via.placeholder.com/100",
                }}
                style={styles.cardImage}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.email}</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: "/(operations)/editParent",
                    params: { parent: JSON.stringify(item) },
                  })
                }
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDisablePress(item.id)}
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
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
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
  deleteButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ParentsAdmin;
