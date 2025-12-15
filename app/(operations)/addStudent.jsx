import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const AddStudentScreen = () => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [parentNationalId, setParentNationalId] = useState("");
  const [image, setImage] = useState(null);
  const [showImageText, setShowImageText] = useState(true);
  const { token } = useAuth();

  // API data states
  const [levels, setLevels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch levels and classes on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const [levelsRes, classesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/levels`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/Classes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Process levels data
        const levelsData = Array.isArray(levelsRes.data)
          ? levelsRes.data
          : levelsRes.data.items || levelsRes.data.data || [];
        const processedLevels = levelsData.map((l) => {
          if (typeof l === "string") {
            return { id: null, name: l };
          }
          return {
            id: l.id,
            name: l.name || l.levelName || "",
          };
        });
        setLevels(processedLevels);

        // Process classes data
        const classesData = Array.isArray(classesRes.data)
          ? classesRes.data
          : classesRes.data.items || classesRes.data.data || [];
        const processedClasses = classesData.map((c) => ({
          id: c.id,
          name: c.name || c.className || "",
          levelId: c.levelId || null,
          levelName: c.levelName || "",
        }));
        setClasses(processedClasses);
      } catch (err) {
        console.error("FETCH-DATA error", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Get available classes for selected grade
  const getAvailableClasses = () => {
    if (!grade) return [];

    // Map grade names to their numeric values
    const gradeToNumber = {
      "First grade": "1",
      "Second Grade": "2",
      "Three Grade": "3",
      "Four Grade": "4",
      "Five Grade": "5",
      "Six Grade": "6",
    };

    const gradeNumber = gradeToNumber[grade];
    if (!gradeNumber) return classes;

    // Filter classes that start with the same number
    return classes.filter((c) => {
      const className = c.name || "";
      return className.startsWith(gradeNumber);
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setShowImageText(false);
    } else {
      setShowImageText(true);
    }
  };

  const handleAddStudent = async () => {
    if (!name || !grade || !studentClass || !parentNationalId) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }
    if (!grade || !studentClass) {
      Alert.alert("Error", "Please select both Grade and Class.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Name", name);
      formData.append("ClassName", studentClass);
      formData.append("LevelName", grade);
      formData.append("ParentNationalID", parentNationalId);

      if (image) {
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        formData.append("File", { uri: image, name: filename, type });
      }

      const resp = await fetch(`${API_BASE}/api/Students`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        let message = `Failed to add student. Status: ${resp.status}`;
        try {
          const json = JSON.parse(txt);
          if (resp.status === 409 && Array.isArray(json.errors)) {
            message = json.errors.join("\n");
          } else if (json.title) {
            message = json.title;
          }
        } catch (_) {
          message = txt || message;
        }
        Alert.alert("Error", message);
        return;
      }

      router.back();
    } catch (err) {
      console.error("ADD-STUDENT error", err);
      Alert.alert("Error", "Failed to add student");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <ImageBackground
          source={{ uri: image || "https://via.placeholder.com/100" }}
          style={styles.imagePreview}
        >
          {showImageText && <Text style={styles.imageText}>+ Add Photo</Text>}
        </ImageBackground>
      </TouchableOpacity>

      <Text style={styles.label}>Name:</Text>
      <TextInput
        placeholder="Name"
        placeholderTextColor="#999"
        style={styles.input}
        onChangeText={setName}
      />

      <Text style={styles.label}>Select Grade:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={grade}
          onValueChange={(value) => {
            setGrade(value);
            setStudentClass("");
          }}
          style={styles.picker}
          itemStyle={{ color: "#333", fontFamily: "System" }}
        >
          <Picker.Item label="Select Grade" value="" />
          {levels.map((l) => (
            <Picker.Item key={l.name} label={l.name} value={l.name} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Class:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={studentClass}
          onValueChange={setStudentClass}
          enabled={!!grade}
          style={styles.picker}
          itemStyle={{ color: "#333", fontFamily: "System" }}
        >
          <Picker.Item label="Select Class" value="" />
          {getAvailableClasses().map((c) => (
            <Picker.Item key={c.id} label={c.name} value={c.name} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Parent&#39;s National ID:</Text>
      <TextInput
        placeholder="Parent's National ID"
        placeholderTextColor="#999"
        style={styles.input}
        onChangeText={setParentNationalId}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddStudent}>
        <Text style={styles.buttonText}>Add Student</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    fontSize: 16,
    color: "#333",
    fontFamily: "System",
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
    fontFamily: "System",
  },
  button: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "System",
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ddd",
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    fontFamily: "System",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    alignSelf: "flex-start",
    color: "#333",
    fontFamily: "System",
  },
});

export default AddStudentScreen;
