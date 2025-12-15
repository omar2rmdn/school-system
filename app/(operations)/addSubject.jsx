import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const AddSubject = () => {
  const router = useRouter();
  const [subjectName, setSubjectName] = useState("");
  const { token } = useAuth();

  const handleAddSubject = async () => {
    if (!subjectName.trim()) return;
    try {
      await axios.post(
        `${API_BASE}/api/subjects`,
        { Name: subjectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.back();
    } catch (err) {
      console.error(err);
      alert("Failed to add subject");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Subject</Text>
      <TextInput
        style={styles.input}
        value={subjectName}
        onChangeText={setSubjectName}
        placeholder="Enter subject name"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddSubject}>
        <Text style={styles.buttonText}>Add Subject</Text>
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

export default AddSubject;
