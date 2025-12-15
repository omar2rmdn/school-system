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
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const News = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/news`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.news || res.data.data || [];
      const mapped = data.map((n) => ({
        ...n,
        title: n.title || n.Title || n.name,
        description: n.description,
        category: n.category || n.eventCategory,
        image:
          n.image && !n.image.startsWith("http")
            ? `${API_BASE}/${n.image}`
            : n.image || "https://via.placeholder.com/150",
      }));
      setNews(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load news");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token && !authIsLoading) fetchNews();
  }, [token, authIsLoading]);

  useFocusEffect(
    useCallback(() => {
      if (token) fetchNews();
    }, [token])
  );

  const deleteNews = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/api/news/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
              data: {},
            });
            setNews((prev) => prev.filter((n) => n.id !== id));
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete news");
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(operations)/addNews")}
      >
        <Text style={styles.addButtonText}>+ Add News</Text>
      </TouchableOpacity>

      <FlatList
        data={news}
        keyExtractor={(item) => item.id.toString()}
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
                    pathname: "/(operations)/editNews",
                    params: { newsItem: JSON.stringify(item) },
                  })
                }
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNews(item.id)}
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
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "System",
  },
  card: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  cardImage: { width: "100%", height: 150, borderRadius: 8 },
  cardInfo: { marginTop: 10 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  cardDescription: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
    fontFamily: "System",
  },
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
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "System",
  },
  center: { justifyContent: "center", alignItems: "center" },
  errorText: {
    color: "#DC3545",
    fontSize: 16,
    fontFamily: "System",
    textAlign: "center",
  },
});

export default News;
