import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const AddComplaint = () => {
  const [image, setImage] = useState(null);
  const params = useLocalSearchParams();
  const [studentName, setStudentName] = useState(params.studentName || "");
  const studentId = params.studentId || "";
  const [description, setDescription] = useState("");
  const { token } = useAuth();
  const router = useRouter();

  // Handle image selection
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!studentId) {
      Alert.alert("Error", "Missing student identifier.");
      return;
    }

    if (!studentName || !description) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Description", description);
      formData.append("StudentName", studentName);
      formData.append("StudentId", studentId);

      if (image) {
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        const fileUri =
          Platform.OS === "ios" ? image.replace("file://", "") : image;
        formData.append("Image", { uri: fileUri, name: filename, type });
      }

      await axios.post(`${API_BASE}/api/complaints`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      Alert.alert("Success", "Complaint submitted successfully");
      router.back();
    } catch (err) {
      console.error("ADD-COMPLAINT error", err.response?.data || err);
      Alert.alert("Error", "Failed to submit complaint");
    }
  };

  return (
    <View style={styles.container}>
      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.addImageText}>Add Image</Text>
        )}
      </TouchableOpacity>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Student Name"
        value={studentName}
        onChangeText={setStudentName}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddComplaint;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  // Image Picker
  imagePicker: {
    width: "100%",
    height: 200,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    borderRadius: 8, // Optional: just slight rounding for modern look
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Optional: ensures image fills the space nicely
  },
  addImageText: { fontSize: 16, color: "#555" },

  // Input Fields
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },

  // Submit Button
  submitButton: {
    backgroundColor: "#007BFF",
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  submitText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
});
