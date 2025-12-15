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

const MonthlyRates = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const currentDate = new Date();
  const [ratings, setRatings] = useState({
    monthWork: "",
    exam: "",
    tasks: "",
    attitude: "",
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    term: "term1",
  });
  const { subjectId, classId } = useLocalSearchParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const openModal = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setRatings({
      monthWork: "",
      exam: "",
      tasks: "",
      attitude: "",
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      term: "term1",
    });
  };

  const saveRating = async () => {
    const { monthWork, exam, tasks, attitude, month, year, term } = ratings;
    if (!monthWork || !exam || !tasks || !attitude || !month || !year) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Validate individual field ranges
    if (Number(monthWork) > 15) {
      Alert.alert("Error", "Month Work cannot exceed 15");
      return;
    }

    if (Number(exam) > 10) {
      Alert.alert("Error", "Exam cannot exceed 10");
      return;
    }

    if (Number(tasks) > 10) {
      Alert.alert("Error", "Tasks cannot exceed 10");
      return;
    }

    if (Number(attitude) > 5) {
      Alert.alert("Error", "Attitude & Conduct cannot exceed 5");
      return;
    }

    const total =
      Number(monthWork) + Number(exam) + Number(tasks) + Number(attitude);
    if (total > 40) {
      Alert.alert("Error", "Total grades cannot exceed 40");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/MonthlyGrades`,
        {
          studentId: Number(selectedStudent.id),
          subjectId: Number(subjectId),
          monthWork: Number(monthWork),
          exam: Number(exam),
          tasks: Number(tasks),
          attitudeAndConduct: Number(attitude),
          month: Number(month),
          year: Number(year),
          term: term,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      closeModal();
    } catch (err) {
      console.error("SAVE-MONTHLY-GRADES", err.response?.data || err.message);
      Alert.alert("Error", "Failed to save monthly grades");
    }
  };

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
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
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
              style={styles.rateButton}
              onPress={() => openModal(item)}
            >
              <Text style={styles.rateText}>Rate</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Rating Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate {selectedStudent?.name}</Text>

            {/* Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Month Work (0-15)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={ratings.monthWork}
              onChangeText={(text) =>
                setRatings({ ...ratings, monthWork: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Exam (0-10)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={ratings.exam}
              onChangeText={(text) => setRatings({ ...ratings, exam: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tasks (0-10)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={ratings.tasks}
              onChangeText={(text) => setRatings({ ...ratings, tasks: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Attitude & Conduct (0-5)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={ratings.attitude}
              onChangeText={(text) =>
                setRatings({ ...ratings, attitude: text })
              }
            />

            {/* Term Picker */}
            <Picker
              selectedValue={ratings.term}
              style={styles.picker}
              itemStyle={{ color: "#333", fontFamily: "System" }}
              onValueChange={(itemValue) =>
                setRatings({ ...ratings, term: itemValue })
              }
            >
              <Picker.Item label="First Term" value="term1" />
              <Picker.Item label="Second Term" value="term2" />
            </Picker>

            {/* Month Input */}
            <TextInput
              style={styles.input}
              placeholder="Month (1-12)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={ratings.month.toString()}
              onChangeText={(text) => setRatings({ ...ratings, month: text })}
            />

            {/* Year Input */}
            <TextInput
              style={styles.input}
              placeholder="Year"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={ratings.year.toString()}
              onChangeText={(text) => setRatings({ ...ratings, year: text })}
            />

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={saveRating}>
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

export default MonthlyRates;

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
  rateButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  rateText: {
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
    height: 50,
    marginBottom: 10,
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
