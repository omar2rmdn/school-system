import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const StudentAttendance = () => {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const studentId = params.studentId;

  const [fromDate, setFromDate] = useState(dayjs().startOf("month").toDate());
  const [toDate, setToDate] = useState(dayjs().endOf("month").toDate());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Fetch student's assigned subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!studentId) return;
      try {
        setSubjectsLoading(true);
        const res = await axios.get(
          `${API_BASE}/api/students/student/${studentId}/subjects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const subjectsList = Array.isArray(res.data)
          ? res.data
          : res.data.subjects || [];
        setSubjects(subjectsList);

        // Set first subject as default if available
        if (subjectsList.length > 0) {
          setSelectedSubject(subjectsList[0].id.toString());
        }
      } catch (err) {
        console.error("FETCH-SUBJECTS", err.response?.data || err.message);
        setSubjects([]);
      } finally {
        setSubjectsLoading(false);
      }
    };
    fetchSubjects();
  }, [studentId, token]);

  // Fetch attendance data when subject or date changes
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId || !selectedSubject) return;

      try {
        setLoading(true);

        // Format dates for API (MM/d/yyyy format)
        const startDate = dayjs(fromDate).format("M/D/YYYY");
        const endDate = dayjs(toDate).format("M/D/YYYY");

        const res = await axios.get(
          `${API_BASE}/api/attandances/student/${studentId}/subject/${selectedSubject}?startdate=${startDate}&enddate=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.attendanceRecords || [];
        setAttendanceData(data);
      } catch (err) {
        console.error("FETCH-ATTENDANCE", err.response?.data || err.message);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId, selectedSubject, fromDate, toDate, token]);

  const handleFromDateChange = (event, selectedDate) => {
    setShowFromPicker(Platform.OS === "ios");
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToPicker(Platform.OS === "ios");
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const renderRecordItem = ({ item }) => {
    const absent = !item.isPresent;
    return (
      <View style={styles.absenceCard}>
        <View
          style={[
            styles.dateBadge,
            { backgroundColor: absent ? "#e74c3c" : "#28a745" },
          ]}
        >
          <Text style={styles.dateDay}>{dayjs(item.date).format("DD")}</Text>
          <Text style={styles.dateMonth}>{dayjs(item.date).format("MMM")}</Text>
        </View>
        <View style={styles.absenceDetails}>
          <Text style={styles.weekdayText}>
            {dayjs(item.date).format("dddd")}
          </Text>
          <Text style={styles.yearText}>{dayjs(item.date).format("YYYY")}</Text>
          <Text style={{ color: absent ? "#e74c3c" : "#28a745", marginTop: 4 }}>
            {absent ? "Absent" : "Present"}
          </Text>
          {item.subject && (
            <Text style={styles.subjectText}>{item.subject}</Text>
          )}
        </View>
      </View>
    );
  };

  if (subjectsLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading subjects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Subject Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Select Subject:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(itemValue) => setSelectedSubject(itemValue)}
            style={styles.picker}
            itemStyle={{ color: "#333", fontFamily: "System" }}
          >
            <Picker.Item label="Select a subject..." value="" />
            {subjects.map((subject) => (
              <Picker.Item
                key={subject.id}
                label={subject.name}
                value={subject.id.toString()}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Date Range Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Date Range:</Text>
        <View style={styles.dateButtonContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowFromPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              From: {dayjs(fromDate).format("MMM D, YYYY")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowToPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              To: {dayjs(toDate).format("MMM D, YYYY")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleFromDateChange}
          maximumDate={toDate}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleToDateChange}
          minimumDate={fromDate}
        />
      )}

      <Text style={styles.subHeader}>Attendance Records</Text>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading attendance...</Text>
        </View>
      ) : attendanceData.length > 0 ? (
        <FlatList
          data={attendanceData}
          keyExtractor={(item, index) => `${item.id || index}-${item.date}`}
          renderItem={renderRecordItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.noRecordsContainer}>
          <Text style={styles.noRecordsText}>
            {selectedSubject
              ? "No attendance records found for the selected subject and date range"
              : "Please select a subject to view attendance records"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#2c3e50",
    textAlign: "center",
    fontFamily: "System",
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    color: "#333",
    fontFamily: "System",
  },
  dateButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    width: "48%",
    alignItems: "center",
  },
  dateButtonText: {
    color: "white",
    fontWeight: "700",
    fontFamily: "System",
  },
  selectedSubjectContainer: {
    backgroundColor: "#e8f4fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#007BFF",
  },
  selectedSubjectText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007BFF",
    fontFamily: "System",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "500",
    color: "#34495e",
    marginBottom: 15,
    fontFamily: "System",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontFamily: "System",
  },
  listContainer: {
    paddingBottom: 20,
  },
  absenceCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateBadge: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    minWidth: 60,
  },
  dateDay: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "System",
  },
  dateMonth: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
    fontFamily: "System",
  },
  absenceDetails: {
    flex: 1,
  },
  weekdayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    fontFamily: "System",
  },
  yearText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
    fontFamily: "System",
  },
  subjectText: {
    fontSize: 12,
    color: "#95a5a6",
    marginTop: 2,
    fontFamily: "System",
  },
  noRecordsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  noRecordsText: {
    fontSize: 16,
    color: "#95a5a6",
    textAlign: "center",
    fontFamily: "System",
  },
});

export default StudentAttendance;
