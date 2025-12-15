import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCallback, useState } from "react";
import { API_BASE, useAuth } from "../../context/AuthContext";

const NewsScreen = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  const fetchNews = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/news`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.news || res.data.data || [];
      const mapped = data.map((n) => ({
        id: n.id?.toString() ?? "",
        title: n.title || n.name || n.newsTitle,
        description: n.description,
        image:
          n.image && !n.image.startsWith("http")
            ? `${API_BASE}/${n.image}`
            : n.image || "https://via.placeholder.com/150",
      }));
      setNewsData(mapped);
    } catch (err) {
      console.error("FETCH-NEWS error", err);
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchNews();
    }, [fetchNews])
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

  return (
    <View style={styles.container}>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const titleIsArabic = isArabic(item.title || "");
          const descriptionIsArabic = isArabic(item.description || "");

          return (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(sub-screens)/newsDetails",
                  params: { news: JSON.stringify(item) },
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.title,
                    titleIsArabic && {
                      textAlign: "right",
                      writingDirection: "rtl",
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    descriptionIsArabic && {
                      textAlign: "right",
                      writingDirection: "rtl",
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    marginTop: 4,
  },
});

export default NewsScreen;
