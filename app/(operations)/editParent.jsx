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

const EditParent = () => {
  const params = useLocalSearchParams();
  const parent = params.parent ? JSON.parse(params.parent) : null;

  // Split incoming full name
  const nameParts = parent?.name ? parent.name.split(" ") : ["", ""];
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(parent?.email || "");
  const [nationalId, setNationalId] = useState(parent?.nationalId || "");
  const [image, setImage] = useState(parent?.image || null);

  const { token } = useAuth();

  // Fetch full parent details to ensure freshest data
  useEffect(() => {
    const fetchDetails = async () => {
      if (!token || !parent?.id) return;

      try {
        const res = await axios.get(`${API_BASE}/api/Users/${parent.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || {};
        if (data.firstName) setFirstName(data.firstName);
        if (data.lastName) setLastName(data.lastName);
        if (data.email) setEmail(data.email);
        if (data.nationalID ?? data.nationalId)
          setNationalId(data.nationalID ?? data.nationalId);
        if (data.image) setImage(data.image);
      } catch (err) {
        console.error("FETCH-PARENT-DETAILS error", err);
      }
    };

    fetchDetails();
  }, [token]);

  if (!parent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Parent data not found</Text>
      </View>
    );
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    if (!firstName || !lastName || !email || !nationalId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("FirstName", firstName);
      formData.append("LastName", lastName);
      formData.append("Email", email);
      formData.append("NationalID", nationalId);
      formData.append("Roles[0]", "Parent");

      if (image && !image.startsWith("http")) {
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        const fileUri =
          Platform.OS === "ios" ? image.replace("file://", "") : image;
        formData.append("File", { uri: fileUri, name: filename, type });
      }

      const url = `${API_BASE}/api/Users/${parent.id}`;
      console.log("EDIT-PARENT hitting", url);
      formData._parts?.forEach((p) => console.log("FD", p[0]));

      const hasLocalImage = formData._parts.find((p) => p[0] === "File");

      const sendJsonFallback = async () => {
        const jsonPayload = Object.fromEntries(
          formData._parts.map(([k, v]) => [k, v])
        );
        delete jsonPayload.File;

        // API expects "Roles" in JSON body, map Roles[0] if present
        if (jsonPayload["Roles[0]"]) {
          jsonPayload.Roles = jsonPayload["Roles[0]"];
          delete jsonPayload["Roles[0]"];
        }
        // Ensure NationalID property matches backend exactly
        if (jsonPayload.NationalID === undefined && nationalId) {
          jsonPayload.NationalID = nationalId;
        }

        console.log("Retrying EDIT-PARENT without File field");
        try {
          await axios.put(url, jsonPayload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (jsonErr) {
          console.log(
            "EDIT-PARENT JSON replied",
            jsonErr.response?.status,
            jsonErr.response?.data
          );
          throw jsonErr;
        }
      };

      if (hasLocalImage) {
        try {
          const resp = await fetch(url, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          if (!resp.ok) {
            const txt = await resp.text();
            console.log("EDIT-PARENT multipart replied", resp.status, txt);
            throw new Error("bad status");
          }
        } catch (e) {
          console.error("EDIT-PARENT multipart error", e);
          await sendJsonFallback();
        }
      } else {
        await sendJsonFallback();
      }

      Alert.alert("Success", "Parent updated successfully!");
      router.back();
    } catch (err) {
      console.error("EDIT-PARENT error", err);
      Alert.alert("Error", "Failed to update parent");
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
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  nameInput: {
    width: "48%",
  },
});

export default EditParent;
