import { Ionicons } from "@expo/vector-icons";
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

const AddAdmin = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { token } = useAuth();

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

  const handleAddAdmin = async () => {
    if (!firstName || !lastName || !email || !nationalId || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("FirstName", firstName);
      formData.append("LastName", lastName);
      formData.append("Email", email);
      formData.append("Password", password);
      formData.append("NationalID", nationalId);
      if (phone.trim()) formData.append("Phone", phone.trim());
      formData.append("Roles[0]", "Admin");

      if (image) {
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        formData.append("File", { uri: image, name: filename, type });
      }

      const response = await fetch(`${API_BASE}/api/Users`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // No Content-Type so RN adds boundary
        body: formData,
      });

      if (!response.ok) {
        const txt = await response.text();
        console.log("ADD-ADMIN server replied", response.status, txt);
        throw new Error("bad status");
      }
      router.back();
    } catch (err) {
      console.error("ADD-ADMIN error", err);
      Alert.alert("Error", "Failed to add admin");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <ImageBackground
          source={{ uri: image || "https://via.placeholder.com/150" }}
          style={styles.image}
        >
          {!image && <Text style={styles.imageText}>Add Photo</Text>}
        </ImageBackground>
      </TouchableOpacity>

      <View style={styles.nameContainer}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        <TextInput
          style={[styles.input, styles.nameInput]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />
      </View>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        value={nationalId}
        onChangeText={setNationalId}
        placeholder="National ID"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddAdmin}>
        <Text style={styles.buttonText}>Add Admin</Text>
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
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ddd",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "bold",
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  nameInput: {
    width: "48%",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#F8F9FA",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 15,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
    padding: 5,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddAdmin;
