import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const StudentCard = ({ student, toggleStatus, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(student)}>
      <Text style={styles.studentName}>{student.name}</Text>
      <TouchableOpacity
        style={[
          styles.statusButton,
          student.status === "present" ? styles.present : styles.absent,
        ]}
        onPress={() => toggleStatus(student.id)}
      >
        <Text style={styles.buttonText}>
          {student.status === "present" ? "Present" : "Absent"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const TeacherAttendance = () => {
  const { classId, subjectId } = useLocalSearchParams();
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [absentStudentId, setAbsentStudentId] = useState(null);
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
        const dataRaw = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        const mapped = dataRaw.map((s) => ({
          id: s.id?.toString() ?? "",
          name: s.name,
          status: "present",
        }));
        setStudents(mapped);
        setFilteredStudents(mapped);
        setAbsentStudentId(null);
      } catch (err) {
        console.error("FETCH-TEACHER-STUDENTS", err);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    if (token && classId && subjectId) fetchStudents();
  }, [token, classId, subjectId]);

  const toggleStatus = (id) => {
    const updateStudents = (prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === id) {
          const newStatus = student.status === "present" ? "absent" : "present";
          if (newStatus === "absent") {
            setAbsentStudentId(id);
            return { ...student, status: "absent" };
          } else {
            setAbsentStudentId(null);
            return { ...student, status: "present" };
          }
        }
        return { ...student, status: "present" };
      });

    setStudents(updateStudents);
    setFilteredStudents(updateStudents);
  };

  const saveAttendance = async () => {
    if (!absentStudentId) return;
    try {
      await axios.post(
        `${API_BASE}/api/attandances`,
        {
          studentId: Number(absentStudentId),
          subjectId: Number(subjectId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      router.back();
    } catch (err) {
      console.error("SAVE-ATTENDANCE", err.response?.data || err.message);
      Alert.alert("Error", "Failed to save attendance");
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
          <StudentCard
            student={item}
            toggleStatus={toggleStatus}
            onPress={() =>
              router.push({
                pathname: `/teacher/attendance-details/${item.id}`,
                params: {
                  student: JSON.stringify(item),
                },
              })
            }
          />
        )}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { opacity: absentStudentId ? 1 : 0.4 }]}
        disabled={!absentStudentId}
        onPress={saveAttendance}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TeacherAttendance;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
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
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  studentName: { fontSize: 18, fontWeight: "bold" },
  statusButton: {
    padding: 10,
    borderRadius: 5,
    width: 90,
    alignItems: "center",
  },
  present: { backgroundColor: "#28a745" },
  absent: { backgroundColor: "#dc3545" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
