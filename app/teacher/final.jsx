import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const Final = () => {
  const { subjectId, classId } = useLocalSearchParams();
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [finalGrade, setFinalGrade] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [term, setTerm] = useState("term1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        setFilteredStudents(students);
      } else {
        const filtered = students.filter((student) =>
          student.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredStudents(filtered);
      }
    },
    [students]
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/Teachers/subjects/${subjectId}/classes/${classId}/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        const mappedStudents = data.map((s) => ({
          id: s.id?.toString() ?? "",
          name: s.name,
        }));
        setStudents(mappedStudents);
        setFilteredStudents(mappedStudents);
      } catch (err) {
        console.error("FETCH-TEACHER-STUDENTS", err);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    if (token && subjectId && classId) fetchStudents();
  }, [token, subjectId, classId]);

  const openModal = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFinalGrade("");
    setYear(new Date().getFullYear().toString());
    setTerm("term1");
  };

  const saveGrade = async () => {
    if (!selectedStudent || !finalGrade || !year) {
      return;
    }

    if (Number(finalGrade) > 60) {
      Alert.alert("Error", "Grade cannot exceed 60");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/api/Grades`,
        {
          studentId: Number(selectedStudent.id),
          subjectId: Number(subjectId),
          degree: Number(finalGrade),
          term: term,
          year: Number(year),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.status !== 200 && res.status !== 201 && res.status !== 204) {
        throw new Error(`Unexpected status ${res.status}`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.response?.data || err.message;
      console.error("SAVE-GRADE", msg);
      setError(msg || "Failed to save grade");
      Alert.alert("Error", msg || "Failed to save grade");
      return;
    } finally {
      closeModal();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#666"
        />
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <Text style={styles.studentName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.gradeButton}
              onPress={() => openModal(item)}
            >
              <Text style={styles.gradeText}>Grade</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Grading Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Final Grade for {selectedStudent?.name}
            </Text>

            {/* Final Grade Input */}
            <TextInput
              style={styles.input}
              placeholder="Final Grade (0-60)"
              keyboardType="numeric"
              value={finalGrade}
              onChangeText={setFinalGrade}
            />

            {/* Year Input */}
            <TextInput
              style={styles.input}
              placeholder="Year"
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
            />

            {/* Term Picker */}
            <Picker
              selectedValue={term}
              style={styles.picker}
              onValueChange={(itemValue) => setTerm(itemValue)}
            >
              <Picker.Item label="First Term" value="term1" />
              <Picker.Item label="Second Term" value="term2" />
            </Picker>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={saveGrade}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Final;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#333",
    fontFamily: "System",
  },
  studentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gradeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  gradeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    marginBottom: 40,
    height: 50,
    color: "#333",
    fontFamily: "System",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
