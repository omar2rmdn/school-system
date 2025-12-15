import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const EditClass = () => {
  const params = useLocalSearchParams();
  const { id, name } = params;
  const [updatedName, setUpdatedName] = useState(name || "");
  const { token } = useAuth();

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Error: Missing Data</Text>
      </View>
    );
  }

  const handleUpdateClass = async () => {
    if (!updatedName.trim()) return;
    try {
      await axios.put(
        `${API_BASE}/api/Classes/${id}`,
        { Name: updatedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.back();
    } catch (err) {
      console.error(err);
      alert("Failed to update class");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Class</Text>
      <TextInput
        style={styles.input}
        value={updatedName}
        onChangeText={setUpdatedName}
        placeholder="Enter new class name"
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateClass}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default EditClass;
