import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const parseStudent = (raw) => {
  const levelClass = raw.className || ""; // e.g., "1/1"
  const [levelNumeric = "", cls = ""] = levelClass.split("/");
  return {
    id: raw.id?.toString() ?? "",
    name: raw.name,
    parentName: raw.parentName || "",
    cls,
    levelNumeric,
    levelName: raw.levelName,
    levelClass,
  };
};

const StudentCard = memo(({ student, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(student.id)}>
    <Text style={styles.studentName}>
      {student.name} {student.parentName}
    </Text>
    <Text style={styles.studentInfo}>
      Level {student.levelNumeric} - Class {student.levelClass}
    </Text>
  </TouchableOpacity>
));

StudentCard.displayName = "StudentCard";

const SupervisorAttendance = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stuRes, levelRes] = await Promise.all([
          axios.get(`${API_BASE}/api/students`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { pageNumber: 1, pageSize: 1000 },
          }),
          axios.get(`${API_BASE}/api/levels`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const stuPayload = stuRes.data.items || stuRes.data.data || stuRes.data;
        const parsedStudents = (Array.isArray(stuPayload) ? stuPayload : [])
          .map(parseStudent)
          .sort((a, b) => a.name.localeCompare(b.name));
        setStudents(parsedStudents);

        const levelArrayRaw =
          levelRes.data.items || levelRes.data.data || levelRes.data;
        const levelArr = (
          Array.isArray(levelArrayRaw) ? levelArrayRaw : []
        ).map((l) => (typeof l === "string" ? l : l.name || l.levelName || ""));
        setLevels(levelArr);
      } catch (err) {
        console.error("FETCH-ATTENDANCE-STUDENTS", err);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    if (token && !authIsLoading) fetchData();
  }, [token, authIsLoading]);

  const classOptions = students
    .filter((s) => selectedLevel === "" || s.levelName === selectedLevel)
    .map((s) => s.cls)
    .filter(Boolean);
  const uniqueClasses = Array.from(new Set(classOptions)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const filteredStudents = students.filter((s) => {
    const levelMatch = selectedLevel === "" || s.levelName === selectedLevel;
    const classMatch = selectedClass === "" || s.cls === selectedClass;
    const searchMatch =
      searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.levelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.levelClass.toLowerCase().includes(searchQuery.toLowerCase());
    return levelMatch && classMatch && searchMatch;
  });

  const handleStudentPress = useCallback((id) => {
    router.push(`/supervisor/attendance-history/${id}`);
  }, []);

  const renderItem = useCallback(
    ({ item }) => <StudentCard student={item} onPress={handleStudentPress} />,
    [handleStudentPress]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Level:</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedLevel}
              style={styles.picker}
              onValueChange={setSelectedLevel}
            >
              <Picker.Item label="All Levels" value="" />
              {levels.map((lvl) => (
                <Picker.Item key={lvl} label={lvl} value={lvl} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Class:</Text>
          <View
            style={[styles.pickerBox, { opacity: selectedLevel ? 1 : 0.3 }]}
          >
            <Picker
              selectedValue={selectedClass}
              style={styles.picker}
              enabled={!!selectedLevel}
              onValueChange={setSelectedClass}
            >
              <Picker.Item label="All Classes" value="" />
              {uniqueClasses.map((cl) => (
                <Picker.Item key={cl} label={cl} value={cl} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, parent, level, or class..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default SupervisorAttendance;

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
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  pickerBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
    fontFamily: "System",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  studentName: { fontSize: 18, fontWeight: "bold" },
  studentInfo: { fontSize: 14, color: "#555" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
