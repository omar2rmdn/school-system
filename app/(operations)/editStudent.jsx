import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
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
import { useAdminData } from "../../context/AdminDataContext";
import { API_BASE, useAuth } from "../../context/AuthContext";

const EditStudent = () => {
  const params = useLocalSearchParams();
  const student = params.student ? JSON.parse(params.student) : null;
  const { token } = useAuth();
  const { parents, loading: adminLoading } = useAdminData();

  // Note: Parent National ID will be fetched from parent data using parentId

  const [name, setName] = useState(student?.name || "");
  const [level, setLevel] = useState(student?.levelName || "");
  const [studentClass, setStudentClass] = useState(student?.className || "");
  const [parentNationalId, setParentNationalId] = useState(
    student?.parentNationalId || ""
  );
  const [image, setImage] = useState(student?.image || null);

  // API data state
  const [levels, setLevels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
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
        }));
        setClasses(processedClasses);
      } catch (err) {
        console.error("FETCH-DATA error", err);
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Find parent's national ID from the AdminDataContext
  useEffect(() => {
    if (student?.parentId && parents.length > 0) {
      const parentData = parents.find((p) => p.id === student.parentId);
      if (parentData && parentData.nationalID) {
        setParentNationalId(parentData.nationalID);
      }
    }
  }, [student?.parentId, parents]);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Error: Student data not found</Text>
      </View>
    );
  }

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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    if (!name || !level || !studentClass || !parentNationalId) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      // Find the selected class ID
      const selectedClass = classes.find((cls) => cls.name === studentClass);
      if (!selectedClass) {
        Alert.alert("Error", "Selected class not found.");
        return;
      }

      // Find the selected level ID
      const selectedLevel = levels.find((lvl) => lvl.name === level);
      if (!selectedLevel || !selectedLevel.id) {
        Alert.alert("Error", "Selected level not found or level ID missing.");
        return;
      }

      const formData = new FormData();
      formData.append("Name", name);
      formData.append("ClassId", selectedClass.id.toString());
      formData.append("LevelId", selectedLevel.id.toString());
      formData.append("ParentNationalID", parentNationalId);

      // Always append File field - either new image or existing image
      if (image && !image.startsWith("http")) {
        // New image selected
        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        formData.append("File", { uri: image, name: filename, type });
      } else if (student?.image) {
        // Keep existing image - create a placeholder file entry
        formData.append("File", {
          uri: student.image,
          name: "existing-image.jpg",
          type: "image/jpeg",
        });
      } else {
        // No image - send empty file
        formData.append("File", "");
      }

      const url = `${API_BASE}/api/Students/${student.id}`;

      const resp = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.log("EDIT-STUDENT replied", resp.status, txt);
        throw new Error("bad status");
      }

      Alert.alert("Success", "Student updated successfully!");
      router.back();
    } catch (err) {
      console.error("EDIT-STUDENT error", err);
      Alert.alert("Error", "Failed to update student");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <ImageBackground
          source={{ uri: image || "https://via.placeholder.com/100" }}
          style={styles.imagePreview}
        />
      </TouchableOpacity>

      <TextInput
        value={name}
        placeholder="Name"
        placeholderTextColor="#999"
        style={styles.input}
        onChangeText={setName}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={level}
          onValueChange={(itemValue) => {
            setLevel(itemValue);
            setStudentClass("");
          }}
          style={styles.picker}
          itemStyle={{ color: "#333", fontFamily: "System" }}
        >
          <Picker.Item label="Select Level" value="" />
          {levels.map((lvl) => (
            <Picker.Item key={lvl.name} label={lvl.name} value={lvl.name} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={studentClass}
          onValueChange={(itemValue) => setStudentClass(itemValue)}
          style={styles.picker}
          itemStyle={{ color: "#333", fontFamily: "System" }}
        >
          <Picker.Item label="Select Class" value="" />
          {classes.map((cls) => (
            <Picker.Item key={cls.id} label={cls.name} value={cls.name} />
          ))}
        </Picker>
      </View>

      <TextInput
        value={parentNationalId}
        placeholder="Parent's National ID"
        placeholderTextColor="#999"
        style={styles.input}
        onChangeText={setParentNationalId}
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
    alignItems: "center",
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#333",
    fontFamily: "System",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    fontFamily: "System",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    fontFamily: "System",
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
    width: "100%",
    color: "#333",
    fontFamily: "System",
  },
  button: {
    backgroundColor: "#28A745",
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
    backgroundColor: "#ccc",
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default EditStudent;
