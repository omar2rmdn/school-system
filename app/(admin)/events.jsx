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
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const Events = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Function to detect if text contains Arabic characters
  const isArabicText = (text) => {
    if (!text) return false;
    const arabicRegex =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  const getTextDirectionStyle = (text) => {
    return isArabicText(text)
      ? { textAlign: "right", writingDirection: "rtl" }
      : { textAlign: "left", writingDirection: "ltr" };
  };

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/Events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      const items = Array.isArray(data) ? data : data.items || data.data || [];

      setEvents(
        items.map((e) => ({
          id: e.id.toString(),
          title: e.name,
          description: e.description,
          image: e.image
            ? `${API_BASE}/${e.image}`
            : "https://via.placeholder.com/150",
        }))
      );
    } catch (err) {
      console.error("FETCH-EVENTS error", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const deleteEvent = async (id) => {
    Alert.alert("Confirm Deletion", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/api/Events/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchEvents();
          } catch (err) {
            console.error("DELETE-EVENT error", err);
            Alert.alert("Error", "Failed to delete event");
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(operations)/addEvents")}
      >
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>

      {loading && events.length === 0 ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={styles.center}>
          <Text>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text
                  style={[styles.cardTitle, getTextDirectionStyle(item.title)]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.cardDescription,
                    getTextDirectionStyle(item.description),
                  ]}
                >
                  {item.description}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    router.push({
                      pathname: "/(operations)/editEvent",
                      params: {
                        event: JSON.stringify(item),
                      },
                    })
                  }
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteEvent(item.id)}
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
  card: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  cardImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  cardInfo: { marginTop: 10 },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardDescription: { fontSize: 14, color: "#333", marginTop: 5 },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#FFC107",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#DC3545",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 14, fontWeight: "bold" },
});

export default Events;
