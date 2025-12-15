import axios from "axios";
import { router, useFocusEffect } from "expo-router";
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

// Helper to detect Arabic characters (comprehensive regex)
const isArabic = (text) => {
  if (!text) return false;
  const arabicRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

const StudentEvents = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/Events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.events || res.data.data || [];
      const mapped = data.map((e) => ({
        id: e.id?.toString() ?? "",
        title: e.title || e.name,
        description: e.description,
        category: e.category || e.eventCategory,
        image:
          e.image && !e.image.startsWith("http")
            ? `${API_BASE}/${e.image}`
            : e.image || "https://via.placeholder.com/150",
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("FETCH-STUDENT-EVENTS error", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

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

  const renderItem = ({ item }) => {
    const rtl = isArabic(item.title + item.description);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/(student-activities)/eventDetails",
            params: { event: JSON.stringify(item) },
          })
        }
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              rtl && { textAlign: "right", writingDirection: "rtl" },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.description,
              rtl && { textAlign: "right", writingDirection: "rtl" },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default StudentEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
});
