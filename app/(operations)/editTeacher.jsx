import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react"; // Added useRef
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const EditTeacher = () => {
  const params = useLocalSearchParams();
  const teacher = params.teacher ? JSON.parse(params.teacher) : null;

  const { token } = useAuth();

  const [firstName, setFirstName] = useState(teacher?.firstName || "");
  const [lastName, setLastName] = useState(teacher?.lastName || "");
  const [nationalId, setNationalId] = useState(
    teacher?.nationalID ?? teacher?.nationalId ?? ""
  );
  const [image, setImage] = useState(
    teacher?.image && !teacher.image.startsWith("http")
      ? `${API_BASE}/${teacher.image}`
      : teacher?.image || null
  );

  // Subjects state
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  // Track if initial subjects have been set
  const initialSubjectsSet = useRef(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle different response formats
        let data = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data.items) {
          data = res.data.items;
        } else if (res.data.data) {
          data = res.data.data;
        }

        setSubjects(data);

        // Set initial subjects selection only once
        if (!initialSubjectsSet.current && teacher?.subjects?.length > 0) {
          const ids = data
            .filter((s) => teacher.subjects.includes(s.name))
            .map((s) => s.id);
          setSelectedSubjectIds(ids);
          initialSubjectsSet.current = true;
        }
      } catch (err) {
        console.error("FETCH-SUBJECTS error", err);
        Alert.alert("Error", "Failed to load subjects");
      }
    };

    if (token) fetchSubjects();
  }, [token]); // Removed teacher dependency

  if (!teacher) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Error: Teacher data not found</Text>
      </View>
    );
  }

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

  const handleSave = async () => {
    if (!firstName || !lastName || !nationalId) {
      return Alert.alert(
        "Error",
        "First name, last name and National ID are required!"
      );
    }

    try {
      // Collect selected subject names
      const selectedSubjectsNames = subjects
        .filter((s) => selectedSubjectIds.includes(s.id))
        .map((s) => s.name);

      const hasNewImage = image && !image.startsWith("http");

      if (hasNewImage) {
        // Use FormData for image upload
        const formData = new FormData();
        formData.append("FirstName", firstName);
        formData.append("LastName", lastName);
        formData.append("NationalID", nationalId);
        formData.append("Subjects", JSON.stringify(selectedSubjectsNames));

        const filename = image.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        const fileUri =
          Platform.OS === "ios" ? image.replace("file://", "") : image;
        formData.append("File", { uri: fileUri, name: filename, type });

        const response = await fetch(`${API_BASE}/api/teachers/${teacher.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const txt = await response.text();
          console.log("EDIT-TEACHER multipart replied", response.status, txt);
          throw new Error("Failed to update teacher");
        }
      } else {
        // Use JSON for text-only updates
        const payload = {
          firstName,
          lastName,
          nationalID: nationalId,
          subjects: selectedSubjectsNames,
        };

        await axios.put(`${API_BASE}/api/teachers/${teacher.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Alert.alert("Success", "Teacher updated successfully!");
      router.back();
    } catch (err) {
      console.error("EDIT-TEACHER error", err);
      let errorMessage = "Failed to update teacher";

      if (err.response) {
        if (err.response.data) {
          errorMessage += `: ${JSON.stringify(err.response.data)}`;
        } else {
          errorMessage += `: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Teacher</Text>

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
      />
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
      />
      <TextInput
        style={styles.input}
        value={nationalId}
        onChangeText={setNationalId}
        placeholder="National ID"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Subjects</Text>
      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setSubjectModalVisible(true)}
      >
        <Text style={styles.selectedText}>
          {selectedSubjectIds.length === 0
            ? "Select Subjects"
            : subjects
                .filter((s) => selectedSubjectIds.includes(s.id))
                .map((s) => s.name)
                .join(", ")}
        </Text>
      </TouchableOpacity>

      {/* Subject selection modal */}
      <Modal
        visible={subjectModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subjects</Text>
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.subjectRow}
                  onPress={() => {
                    setSelectedSubjectIds((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                >
                  <Text style={styles.subjectName}>{item.name}</Text>
                  {selectedSubjectIds.includes(item.id) ? (
                    <MaterialIcons name="check-box" size={24} color="green" />
                  ) : (
                    <MaterialIcons
                      name="check-box-outline-blank"
                      size={24}
                      color="#888"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSubjectModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
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
    marginBottom: 15,
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
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#eee",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  addPhotoText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    overflow: "hidden",
  },
  selectedText: {
    fontSize: 14,
    color: "#555",
    padding: 10,
  },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  subjectName: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: "80%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditTeacher;
