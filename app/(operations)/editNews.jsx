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

const EditNewsScreen = () => {
  const params = useLocalSearchParams();
  const newsItem = params.newsItem ? JSON.parse(params.newsItem) : null;

  const [title, setTitle] = useState(newsItem?.title || "");
  const [description, setDescription] = useState(newsItem?.description || "");
  const [image, setImage] = useState(
    newsItem?.image && !newsItem.image.startsWith("http")
      ? `${API_BASE}/${newsItem.image}`
      : newsItem?.image || null
  );

  const { token } = useAuth();

  if (!newsItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>News data not found</Text>
      </View>
    );
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    const startTime = Date.now();
    console.log(
      "🚀 EDIT-NEWS: Starting handleSaveChanges at",
      new Date().toISOString()
    );

    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const formDataStart = Date.now();
      console.log("📝 EDIT-NEWS: Building FormData...");

      const formData = new FormData();
      formData.append("Name", title); // API expects "Name" not "Title"
      formData.append("Description", description);

      console.log("📊 EDIT-NEWS: Data being sent:", {
        Name: title,
        Description: description,
        NewsId: newsItem.id,
        ImageType:
          image && !image.startsWith("http")
            ? "NEW_LOCAL"
            : image
              ? "EXISTING_REMOTE"
              : "NONE",
      });

      // Always append File field - either new image or existing image
      if (image && !image.startsWith("http")) {
        // New image selected
        console.log("🖼️ EDIT-NEWS: Processing NEW image file");
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        const fileUri =
          Platform.OS === "ios" ? image.replace("file://", "") : image;
        formData.append("File", { uri: fileUri, name: filename, type });
        console.log("✅ EDIT-NEWS: Added new image file:", {
          filename,
          type,
          fileUri: fileUri.substring(0, 50) + "...",
        });
      } else if (newsItem?.image) {
        // Keep existing image - slow but preserves the actual image
        console.log(
          "🔄 EDIT-NEWS: Processing EXISTING image (will be slow but preserves image)"
        );
        const imageUri = newsItem.image.startsWith("http")
          ? newsItem.image
          : `${API_BASE}/${newsItem.image}`;
        formData.append("File", {
          uri: imageUri,
          name: "existing-image.jpg",
          type: "image/jpeg",
        });
        console.log(
          "✅ EDIT-NEWS: Added existing image placeholder:",
          imageUri
        );
      } else {
        // No image - send empty file
        console.log("❌ EDIT-NEWS: No image - adding empty File field");
        formData.append("File", "");
      }

      const formDataTime = Date.now() - formDataStart;
      console.log("⏱️ EDIT-NEWS: FormData building took", formDataTime, "ms");

      const networkStart = Date.now();
      console.log(
        "🌐 EDIT-NEWS: Starting network request to",
        `${API_BASE}/api/news/${newsItem.id}`
      );

      const resp = await fetch(`${API_BASE}/api/news/${newsItem.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const networkTime = Date.now() - networkStart;
      console.log("⏱️ EDIT-NEWS: Network request took", networkTime, "ms");
      console.log(
        "📡 EDIT-NEWS: Response status:",
        resp.status,
        resp.statusText
      );

      if (!resp.ok) {
        const txt = await resp.text();
        console.log("❌ EDIT-NEWS: Request failed with status", resp.status);
        console.log("❌ EDIT-NEWS: Error response:", txt);
        throw new Error(`Request failed: ${resp.status} - ${txt}`);
      }

      const responseText = await resp.text();
      const totalTime = Date.now() - startTime;
      console.log("🎉 EDIT-NEWS: Success! Total time:", totalTime, "ms");
      console.log("📈 EDIT-NEWS: Performance breakdown:", {
        formDataTime: formDataTime + "ms",
        networkTime: networkTime + "ms",
        totalTime: totalTime + "ms",
      });

      Alert.alert("Success", "News updated successfully!");
      router.back();
    } catch (err) {
      const totalTime = Date.now() - startTime;
      console.error("💥 EDIT-NEWS: Error after", totalTime, "ms:", err);
      Alert.alert("Error", "Failed to update news");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <ImageBackground
          source={{
            uri:
              image ||
              "https://via.placeholder.com/300x150?text=Edit+News+Image",
          }}
          style={styles.image}
        />
      </TouchableOpacity>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="News Title"
        style={styles.input}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="News Description"
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
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
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#F8F9FA",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditNewsScreen;
