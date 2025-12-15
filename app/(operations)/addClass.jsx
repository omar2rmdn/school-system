import axios from "axios";
import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const AddClass = () => {
  const [className, setClassName] = useState("");
  const { token } = useAuth();

  const handleAddClass = async () => {
    if (!className.trim()) return;
    try {
      await axios.post(
        `${API_BASE}/api/Classes`,
        { Name: className },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.back();
    } catch (err) {
      console.error(err);
      alert("Failed to add class");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Class</Text>
      <TextInput
        style={styles.input}
        value={className}
        onChangeText={setClassName}
        placeholder="Enter class name"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddClass}>
        <Text style={styles.buttonText}>Add Class</Text>
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
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default AddClass;
