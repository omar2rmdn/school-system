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

const AssignStudentSubjects = () => {
  const params = useLocalSearchParams();
  const student = params.student ? JSON.parse(params.student) : null;
  const { token } = useAuth();

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

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
        // preselect if student.subjects exists
        if (student?.subjects?.length) {
          const first = data.find((s) => student.subjects.includes(s.name));
          if (first) setSelectedSubjectId(first.id);
        }
      } catch (err) {
        console.error("FETCH-SUBJECTS", err);
        Alert.alert("Error", "Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSubjects();
  }, [token]);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Error: Student data not found</Text>
      </View>
    );
  }

  const assignSubjects = async () => {
    if (!selectedSubjectId) {
      Alert.alert("Error", "Please select a subject");
      return;
    }

    try {
      const url = `${API_BASE}/api/Admin/Students/${student.id}/assign-subject/${selectedSubjectId}`;
      await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.back();
    } catch (err) {
      console.error("ASSIGN-STUDENT-SUBJECT", err);
      Alert.alert("Error", "Failed to assign subject");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Assign Subjects to {student.name}</Text>

      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectedTextDisplay}>
          {selectedSubjectId
            ? subjects.find((s) => s.id === selectedSubjectId)?.name
            : "Select Subject"}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
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
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.assignButton} onPress={assignSubjects}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
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
  selectedTextDisplay: { fontSize: 14, color: "#555", padding: 10 },
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
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  subjectName: { fontSize: 16 },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  assignButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  center: { justifyContent: "center", alignItems: "center" },
});

export default AssignStudentSubjects;
