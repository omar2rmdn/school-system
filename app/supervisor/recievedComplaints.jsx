import axios from "axios";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
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

const MAX_DESCRIPTION_LENGTH = 60;

const truncate = (text, maxLength) =>
  text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

// Memoized complaint item to prevent unnecessary re-renders
const ComplaintItem = memo(({ item, onPress }) => {
  const imageUrl = item.imageUrl
    ? `${API_BASE}/${item.imageUrl.replace(/\\/g, "/")}`
    : "https://via.placeholder.com/60";

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        // Performance optimizations for images
        resizeMode="cover"
        fadeDuration={0}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.studentName}</Text>
        <Text style={styles.description}>
          {truncate(item.description, MAX_DESCRIPTION_LENGTH)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

ComplaintItem.displayName = "ComplaintItem";

const ReceivedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/complaints`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComplaints(response.data);
      } catch (err) {
        setError("Failed to fetch complaints.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token && !authIsLoading) {
      fetchComplaints();
    } else if (!authIsLoading) {
      setLoading(false);
      setError("No token found, please login.");
    }
  }, [token, authIsLoading]);

  // Optimized navigation handler - only pass ID, not heavy objects
  const handleComplaintPress = useCallback((complaint) => {
    router.push({
      pathname: `/supervisor/complaint-details/${complaint.id}`,
      params: {
        studentName: complaint.studentName,
        description: complaint.description,
        imageUrl: complaint.imageUrl,
        status: complaint.status,
      },
    });
  }, []);

  // Optimized renderItem with useCallback
  const renderItem = useCallback(
    ({ item }) => <ComplaintItem item={item} onPress={handleComplaintPress} />,
    [handleComplaintPress]
  );

  // Optimized keyExtractor
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  // Performance optimization for FlatList
  const getItemLayout = useCallback(
    (data, index) => ({
      length: 88, // Approximate height of each item
      offset: 88 * index,
      index,
    }),
    []
  );

  if (loading || authIsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={complaints}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        ListEmptyComponent={<Text>No complaints found.</Text>}
      />
    </View>
  );
};

export default ReceivedComplaints;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
