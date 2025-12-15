import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const ComplaintForm = () => {
  const { name, studentId, parentId } = useLocalSearchParams();
  const [studentName, setStudentName] = useState(name);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const { token } = useAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const deleteImage = () => {
    setImage(null);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("Description", description);
      formData.append("StudentName", studentName);
      formData.append("StudentId", studentId);
      formData.append("ReceiverId", parentId);

      if (image) {
        const filename = image.split("/").pop();
        const fileType = filename.split(".").pop();
        formData.append("Image", {
          uri: image,
          name: filename,
          type: `image/${fileType}`,
        });
      }

      await axios.post(`${API_BASE}/api/complaints`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Complaint submitted!");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Failed to submit complaint");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Proof Image:</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity onPress={deleteImage} style={styles.deleteButton}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.imagePlaceholder}>Tap to select image</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Student Name:</Text>
      <TextInput
        value={studentName}
        onChangeText={setStudentName}
        style={styles.input}
        placeholder="Enter student name"
      />

      <Text style={styles.label}>Description:</Text>
      <TextInput
        placeholder="Write the complaint..."
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Submit Complaint</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.button, { backgroundColor: "red", marginTop: 10 }]}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ComplaintForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 16,
    color: "#333",
    fontFamily: "System",
  },
  imagePicker: {
    height: 180,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  imagePlaceholder: {
    color: "#888",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF0000",
    width: 30,
    height: 30,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
});
