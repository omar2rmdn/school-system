import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../../context/AuthContext";

const ComplaintDetails = () => {
  const params = useLocalSearchParams();
  const {
    id,
    studentName,
    description,
    imageUrl: paramImageUrl,
    status: initialStatus,
  } = params;
  const navigation = useNavigation();
  const { token, user } = useAuth();

  const [complaint, setComplaint] = useState(null);

  const [status, setStatus] = useState(initialStatus || "New");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (studentName && description) {
      // Data already provided
      setComplaint({
        id,
        studentName,
        description,
        imageUrl: paramImageUrl,
        status: initialStatus,
      });
      setLoading(false);
    } else if (id && token) {
      const fetchComplaint = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`${API_BASE}/api/complaints/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setComplaint(res.data);
          setStatus(res.data.status || "New");
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "Failed to load complaint details.");
        } finally {
          setLoading(false);
        }
      };
      fetchComplaint();
    }
  }, [id, token]);

  const handleUpdate = async () => {
    if (!complaint) return;
    if (!user?.roles?.includes("Supervisor")) {
      Alert.alert(
        "Unauthorized",
        "You are not allowed to update complaint status."
      );
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        `${API_BASE}/api/complaints/${complaint.id}/status`,
        JSON.stringify(status),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      Alert.alert("Success", "Complaint status updated.");
      // Optionally refresh list when navigating back
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update complaint status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.center}>
        <Text>No data found.</Text>
      </View>
    );
  }

  const imageUrl = complaint.imageUrl
    ? `${API_BASE}/${complaint.imageUrl.replace(/\\/g, "/")}`
    : "https://via.placeholder.com/300";

  return (
    <ScrollView style={styles.container}>
      {/* Complaint Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Complaint Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{complaint.studentName}</Text>
        <Text style={styles.description}>{complaint.description}</Text>

        {/* Status Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Status:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={styles.picker}
              dropdownIconColor="#333"
            >
              <Picker.Item label="New" value="New" />
              <Picker.Item label="In Review" value="InReview" />
              <Picker.Item label="Responded" value="Responded" />
              <Picker.Item label="Closed" value="Closed" />
            </Picker>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, saving && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={saving}
        >
          <Text style={styles.updateButtonText}>
            {saving ? "Updating..." : "Update"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ComplaintDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 20,
  },
  dropdownContainer: {
    marginTop: 10,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#333",
  },
  updateButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
