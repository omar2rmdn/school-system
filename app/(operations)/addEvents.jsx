import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const AddEvent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const { token } = useAuth();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddEvent = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Name", title);
      formData.append("Description", description);

      if (image) {
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        formData.append("File", { uri: image, name: filename, type });
      }

      const resp = await fetch(`${API_BASE}/api/Events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        let message = `Failed to add event. Status: ${resp.status}`;
        try {
          const json = JSON.parse(txt);
          if (json.title) message = json.title;
        } catch (_) {
          message = txt || message;
        }
        Alert.alert("Error", message);
        return;
      }

      router.back();
    } catch (err) {
      console.error("ADD-EVENT error", err);
      Alert.alert("Error", "Failed to add event");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <ImageBackground
          source={{
            uri:
              image ||
              "https://via.placeholder.com/300x150?text=Add+Event+Image",
          }}
          style={styles.image}
        >
          {!image && <Text style={styles.imageText}>Add Photo</Text>}
        </ImageBackground>
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

      <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
        <Text style={styles.addButtonText}>Add Event</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
  },
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
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default AddEvent;
