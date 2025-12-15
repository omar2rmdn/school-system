import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

const Admins = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        setFilteredAdmins(admins);
      } else {
        const filtered = admins.filter(
          (admin) =>
            admin.name.toLowerCase().includes(query.toLowerCase()) ||
            admin.email.toLowerCase().includes(query.toLowerCase()) ||
            admin.nationalID.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredAdmins(filtered);
      }
    },
    [admins]
  );

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/Users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.data || [];

      const adminOnly = items.filter(
        (u) => u.roles && u.roles.includes("Admin")
      );

      const parsed = adminOnly.map((u) => ({
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
      }));

      const adminsData = parsed
        .filter((u) => !u.isDisabled)
        .sort((a, b) => a.name.localeCompare(b.name));

      setAdmins(adminsData);
      setFilteredAdmins(adminsData);
    } catch (err) {
      console.error("FETCH-ADMINS error", err);
      setError("Failed to load admins");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token && !authIsLoading) fetchAdmins();
  }, [token, authIsLoading]);

  useFocusEffect(
    useCallback(() => {
      if (token) fetchAdmins();
    }, [token])
  );

  const disableAdmin = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/Users/${id}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      setFilteredAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("DISABLE-ADMIN error", err);
      Alert.alert("Error", "Failed to disable admin");
    }
  };

  const confirmDisable = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this admin?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => disableAdmin(id),
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAdmins();
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
        onPress={() => router.push("/(operations)/addAdmin")}
      >
        <Text style={styles.addButtonText}>+ Add New Admin</Text>
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
        data={filteredAdmins}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
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
                    pathname: "/(operations)/editAdmin",
                    params: { admin: JSON.stringify(item) },
                  })
                }
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDisable(item.id)}
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
    backgroundColor: "#FFC107",
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

export default Admins;
