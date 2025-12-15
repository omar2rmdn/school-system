import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const EditEvent = () => {
  const params = useLocalSearchParams();
  const event = params.event ? JSON.parse(params.event) : null;

  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [image, setImage] = useState(event?.image || null);

  const { token } = useAuth();

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Event data not found</Text>
      </View>
    );
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    const startTime = Date.now();
    console.log(
      "🚀 EDIT-EVENT: Starting handleSaveChanges at",
      new Date().toISOString()
    );

    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const formDataStart = Date.now();
      console.log("📝 EDIT-EVENT: Building FormData...");

      const formData = new FormData();
      formData.append("Name", title);
      formData.append("Description", description);

      console.log("📊 EDIT-EVENT: Data being sent:", {
        Name: title,
        Description: description,
        EventId: event.id,
        ImageType:
          image && !image.startsWith("http")
            ? "NEW_LOCAL"
            : image
              ? "EXISTING_REMOTE"
              : "NONE",
      });

      // Always append File field (API requirement) but optimize for performance
      if (image && !image.startsWith("http")) {
        // New image selected - send file
        console.log("🖼️ EDIT-EVENT: Processing NEW image file");
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        const fileUri =
          Platform.OS === "ios" ? image.replace("file://", "") : image;
        formData.append("File", { uri: fileUri, name: filename, type });
        console.log("✅ EDIT-EVENT: Added new image file:", {
          filename,
          type,
          fileUri: fileUri.substring(0, 50) + "...",
        });
      } else if (event?.image) {
        // Keep existing image - slow but preserves the actual image
        console.log(
          "🔄 EDIT-EVENT: Processing EXISTING image (will be slow but preserves image)"
        );
        const imageUri = event.image.startsWith("http")
          ? event.image
          : `${API_BASE}/${event.image}`;
        formData.append("File", {
          uri: imageUri,
          name: "existing-image.jpg",
          type: "image/jpeg",
        });
        console.log(
          "✅ EDIT-EVENT: Added existing image placeholder:",
          imageUri
        );
      } else {
        // No image - send empty file
        console.log("❌ EDIT-EVENT: No image - adding empty File field");
        formData.append("File", "");
      }

      const formDataTime = Date.now() - formDataStart;
      console.log("⏱️ EDIT-EVENT: FormData building took", formDataTime, "ms");

      const networkStart = Date.now();
      console.log(
        "🌐 EDIT-EVENT: Starting network request to",
        `${API_BASE}/api/Events/${event.id}`
      );

      const resp = await fetch(`${API_BASE}/api/Events/${event.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const networkTime = Date.now() - networkStart;
      console.log("⏱️ EDIT-EVENT: Network request took", networkTime, "ms");
      console.log(
        "📡 EDIT-EVENT: Response status:",
        resp.status,
        resp.statusText
      );

      if (!resp.ok) {
        const txt = await resp.text();
        console.log("❌ EDIT-EVENT: Request failed with status", resp.status);
        console.log("❌ EDIT-EVENT: Error response:", txt);
        throw new Error(`Request failed: ${resp.status} - ${txt}`);
      }

      const totalTime = Date.now() - startTime;
      console.log("🎉 EDIT-EVENT: Success! Total time:", totalTime, "ms");
      console.log("📈 EDIT-EVENT: Performance breakdown:", {
        formDataTime: formDataTime + "ms",
        networkTime: networkTime + "ms",
        totalTime: totalTime + "ms",
      });

      Alert.alert("Success", "Event updated successfully!");
      router.back();
    } catch (err) {
      const totalTime = Date.now() - startTime;
      console.error("💥 EDIT-EVENT: Error after", totalTime, "ms:", err);
      Alert.alert("Error", "Failed to update event");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <ImageBackground
          source={{
            uri:
              image ||
              "https://via.placeholder.com/300x150?text=Edit+Event+Image",
          }}
          style={styles.image}
        />
      </TouchableOpacity>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Event Title"
        style={styles.input}
      />

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Event Description"
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 5,
  },
  image: { width: "100%", height: "100%" },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  textArea: {
    height: 100,
    verticalAlign: "top",
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default EditEvent;
