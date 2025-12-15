import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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

const AddTeacher = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [image, setImage] = useState(null);
  const { token } = useAuth();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddTeacher = async () => {
    if (!firstName || !lastName || !email || !password || !nationalId) {
      return Alert.alert("Error", "All fields are required!");
    }

    try {
      const formData = new FormData();
      formData.append("FirstName", firstName);
      formData.append("LastName", lastName);
      formData.append("Email", email);
      formData.append("Password", password);
      formData.append("NationalID", nationalId);

      if (image) {
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        const fileUri =
          Platform.OS === "ios" ? image.replace("file://", "") : image;
        formData.append("File", { uri: fileUri, name: filename, type });
      }

      // Use native fetch for more control
      const response = await fetch(`${API_BASE}/api/teachers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type so React Native sets proper boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const txt = await response.text();
        console.log("ADD-TEACHER server replied", response.status, txt);
        throw new Error("Server validation error");
      }
      router.back();
    } catch (err) {
      console.error("ADD-TEACHER error", err);
      Alert.alert("Error", "Failed to add teacher");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.addPhotoText}>Add Photo</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={nationalId}
        onChangeText={setNationalId}
        placeholder="National ID"
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddTeacher}>
        <Text style={styles.buttonText}>Add Teacher</Text>
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
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    fontFamily: "System",
  },
  button: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "System",
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ccc",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: { width: "100%", height: "100%", borderRadius: 75 },
  addPhotoText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "System",
  },
});

export default AddTeacher;
