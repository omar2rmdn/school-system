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
  const levelClass =
    raw.levelClass || raw.className || raw.level_and_class || ""; // e.g., "1/1"
  const [level = "", cls = ""] = levelClass.split("/");
  return {
    id:
      raw.id?.toString() ||
      raw.studentId?.toString() ||
      Math.random().toString(),
    name:
      raw.fullName ||
      raw.name ||
      `${raw.firstName || ""} ${raw.lastName || ""}`.trim(),
    parentName: raw.parentName || "",
    levelName: raw.levelName || raw.level || level, // e.g., "First grade"
    level: level, // numeric level part, if needed
    cls: raw.cls?.toString() || raw.className?.toString() || cls,
    parentId: raw.parentId || raw.parentID || raw.guardianId || "",
  };
};

// Memoized student card component
const StudentItem = memo(({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)}>
    <View style={styles.studentCard}>
      <Text style={styles.name}>
        {item.name} {item.parentName}
      </Text>
      <Text style={styles.details}>
        Level {item.level} - Class {item.cls}
      </Text>
    </View>
  </TouchableOpacity>
));

StudentItem.displayName = "StudentItem";

const SendComplaint = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [levels, setLevels] = useState([]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // parallel fetch students and levels
        const [stuRes, levelRes] = await Promise.all([
          axios.get(`${API_BASE}/api/students`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { pageNumber: 1, pageSize: 1000 },
          }),
          axios.get(`${API_BASE}/api/levels`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // students processing
        let list = [];
        const payload = stuRes.data;
        if (Array.isArray(payload)) list = payload;
        else if (payload.items) list = payload.items;
        else if (payload.data) list = payload.data;
        const parsed = list
          .map(parseStudent)
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
          );
        setStudents(parsed);

        // levels processing; assume array of level objects with name property or string
        const levelArrRaw = Array.isArray(levelRes.data)
          ? levelRes.data
          : levelRes.data.items || levelRes.data.data || [];
        const levelArr = levelArrRaw.map((lv) =>
          typeof lv === "string" ? lv : lv.name || lv.levelName || ""
        );
        setLevels(levelArr);
      } catch (err) {
        console.error("FETCH-STUDENTS-LEVELS", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (token && !authIsLoading) fetchData();
    else if (!token && !authIsLoading) {
      setLoading(false);
      setError("No token found");
    }
  }, [token, authIsLoading]);

  // recompute classOptions based on selectedLevel
  const classOptions = students
    .filter((s) => selectedLevel === "" || s.levelName === selectedLevel)
    .map((s) => s.cls)
    .filter(Boolean);
  const uniqueClassOptions = Array.from(new Set(classOptions)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const levelOptions = levels.length
    ? levels
    : Array.from(new Set(students.map((s) => s.levelName).filter(Boolean)));

  // adjust filtering students to include search by name
  const filteredStudents = students.filter((student) => {
    const levelMatch =
      selectedLevel === "" || student.levelName === selectedLevel;
    const classMatch = selectedClass === "" || student.cls === selectedClass;
    const searchMatch =
      searchQuery === "" ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.levelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.cls.toLowerCase().includes(searchQuery.toLowerCase());
    return levelMatch && classMatch && searchMatch;
  });

  // Optimized navigation handler
  const handleStudentPress = useCallback((student) => {
    router.push({
      pathname: "/supervisor/complaintForm",
      params: {
        name: student.name,
        studentId: student.id,
        parentId: student.parentId,
        level: student.level,
        class: student.cls,
      },
    });
  }, []);

  // Optimized renderItem
  const renderItem = useCallback(
    ({ item }) => <StudentItem item={item} onPress={handleStudentPress} />,
    [handleStudentPress]
  );

  // Optimized keyExtractor
  const keyExtractor = useCallback((item) => item.id, []);

  // Performance optimization for FlatList
  const getItemLayout = useCallback(
    (data, index) => ({
      length: 80, // Approximate height of each student card
      offset: 80 * index,
      index,
    }),
    []
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
      {/* Dropdowns */}
      <View style={styles.dropdownContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Level:</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedLevel}
              onValueChange={setSelectedLevel}
              style={styles.picker}
            >
              <Picker.Item label="All" value="" />
              {levelOptions.map((lvl) => (
                <Picker.Item key={lvl} label={lvl} value={lvl} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Class:</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedClass}
              onValueChange={setSelectedClass}
              style={styles.picker}
            >
              <Picker.Item label="All" value="" />
              {uniqueClassOptions.map((cl) => (
                <Picker.Item key={cl} label={cl} value={cl} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, parent, level, or class..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#666"
        />
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={6}
        initialNumToRender={6}
      />
    </View>
  );
};

export default SendComplaint;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
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
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#333",
    fontFamily: "System",
  },
  details: {
    color: "#666",
    fontFamily: "System",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
