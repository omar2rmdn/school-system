import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

const EditSupervisor = () => {
  const params = useLocalSearchParams();
  const supervisor = params.supervisor ? JSON.parse(params.supervisor) : null;

  // Split full name into first and last names
  const nameParts = supervisor?.name ? supervisor.name.split(" ") : ["", ""];
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(supervisor?.email || "");
  const [nationalId, setNationalId] = useState(
    supervisor?.nationalId ?? supervisor?.nationalID ?? ""
  );
  const [image, setImage] = useState(
    supervisor?.image && !supervisor.image.startsWith("http")
      ? `${API_BASE}/${supervisor.image}`
      : supervisor?.image || null
  );
  const { token } = useAuth();

  // Fetch full supervisor details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!token || !supervisor?.id) return;

      try {
        const res = await axios.get(`${API_BASE}/api/Users/${supervisor.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || {};
        if (data.firstName) setFirstName(data.firstName);
        if (data.lastName) setLastName(data.lastName);
        if (data.email) setEmail(data.email);
        if (data.nationalID ?? data.nationalId)
          setNationalId(data.nationalID ?? data.nationalId);
        if (data.image) {
          const imageUrl =
            data.image && !data.image.startsWith("http")
              ? `${API_BASE}/${data.image}`
              : data.image;
          setImage(imageUrl);
        }
      } catch (err) {
        console.error("FETCH-SUPERVISOR-DETAILS error", err);
      }
    };

    fetchDetails();
  }, [token]);

  if (!supervisor) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Supervisor data not found</Text>
      </View>
    );
  }

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

  const handleSaveChanges = async () => {
    if (!firstName || !lastName || !nationalId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("FirstName", firstName);
      formData.append("LastName", lastName);
      formData.append("Email", email);
      formData.append("NationalID", nationalId);
      formData.append("Roles", "Supervisor"); // Changed from Roles[0] to Roles

      // Always append File field - either new image or existing image
      if (image && !image.startsWith("http")) {
        // New image selected
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        const fileUri =
          Platform.OS === "ios" ? image.replace("file://", "") : image;
        formData.append("File", { uri: fileUri, name: filename, type });
      } else if (supervisor?.image) {
        // Keep existing image - create a placeholder file entry
        formData.append("File", {
          uri: supervisor.image.startsWith("http")
            ? supervisor.image
            : `${API_BASE}/${supervisor.image}`,
          name: "existing-image.jpg",
          type: "image/jpeg",
        });
      } else {
        // No image - send empty file
        formData.append("File", "");
      }

      const url = `${API_BASE}/api/Users/${supervisor.id}`;

      console.log("EDIT-SUPERVISOR: Sending request to", url);
      console.log("EDIT-SUPERVISOR: Data being sent:", {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        NationalID: nationalId,
        Roles: "Supervisor",
      });

      // Always use FormData with File field (as API requires it)
      const resp = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.log("EDIT-SUPERVISOR replied", resp.status, txt);
        throw new Error("bad status");
      }

      const responseText = await resp.text();
      console.log("EDIT-SUPERVISOR: Success response:", responseText);

      Alert.alert("Success", "Supervisor updated successfully!");
      router.back();
    } catch (err) {
      console.error("EDIT-SUPERVISOR error", err);
      Alert.alert("Error", "Failed to update supervisor");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <ImageBackground
          source={{ uri: image || "https://via.placeholder.com/150" }}
          style={styles.image}
        />
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

      <TextInput
        style={styles.input}
        value={nationalId}
        onChangeText={setNationalId}
        placeholder="National ID"
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Save Changes</Text>
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
  button: {
    backgroundColor: "#28A745",
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

export default EditSupervisor;
