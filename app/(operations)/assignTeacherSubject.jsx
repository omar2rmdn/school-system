import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const AssignSubjects = () => {
  const params = useLocalSearchParams();
  const teacher = params.teacher ? JSON.parse(params.teacher) : null;
  const { token } = useAuth();

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        setSubjects(data);
      } catch (err) {
        console.error("FETCH-SUBJECTS error", err);
        Alert.alert("Error", "Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSubjects();
  }, [token]);

  useEffect(() => {
    if (subjects.length > 0 && teacher?.subjects?.length > 0) {
      const first = subjects.find((s) => teacher.subjects.includes(s.name));
      if (first) setSelectedSubjectId(first.id);
    }
  }, [subjects]);

  const assignSubject = async () => {
    if (!selectedSubjectId) {
      Alert.alert("Error", "Please select a subject");
      return;
    }

    try {
      const url = `${API_BASE}/api/Admin/teachers/${teacher?.id}/assign-subject/${selectedSubjectId}`;
      await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.back();
    } catch (err) {
      console.error("ASSIGN-SUBJECT error", err);
      Alert.alert("Error", "Failed to assign subject");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Assign Subject to {teacher?.firstName} {teacher?.lastName}
      </Text>

      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setSubjectModalVisible(true)}
      >
        <Text style={styles.selectedText}>
          {selectedSubjectId
            ? subjects.find((s) => s.id === selectedSubjectId)?.name
            : "Select Subject"}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
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
                  style={styles.row}
                  onPress={() => {
                    setSelectedSubjectId(item.id);
                  }}
                >
                  <Text style={styles.subjectName}>{item.name}</Text>
                  {selectedSubjectId === item.id ? (
                    <MaterialIcons
                      name="radio-button-checked"
                      size={24}
                      color="green"
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-unchecked"
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

      <TouchableOpacity style={styles.assignButton} onPress={assignSubject}>
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
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  selectedText: {
    fontSize: 14,
    color: "#555",
    padding: 10,
  },
  assignButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  subjectName: {
    flex: 1,
    marginRight: 10,
  },
  modalCloseButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AssignSubjects;
