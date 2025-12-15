import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import { API_BASE, useAuth } from "../../../context/AuthContext";

const dayNameToNumber = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// Keep only digits and colons
const formatTimeInput = (text) =>
  text
    .replace(/[^0-9:]/g, "")
    .replace(/:+/g, ":")
    .substring(0, 8);

// Ensure valid HH:MM or HH:MM:SS, return normalized string
const validateTimeString = (timeStr) => {
  const parts = timeStr.split(":").map((p) => parseInt(p, 10));
  const [h, m, s = 0] = parts;
  if (
    isNaN(h) ||
    isNaN(m) ||
    isNaN(s) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59 ||
    s < 0 ||
    s > 59
  )
    return null;
  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const ClassTimetable = () => {
  const { className, classId } = useLocalSearchParams();
  const { token } = useAuth();

  const [selectedDay, setSelectedDay] = useState("Sunday");
  const [subjects, setSubjects] = useState({});

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [subject, setSubject] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [subjectsList, setSubjectsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  // Load subjects and teachers
  useEffect(() => {
    const fetchLookups = async () => {
      if (!token) return;
      try {
        const [subRes, teachRes] = await Promise.all([
          axios.get(`${API_BASE}/api/subjects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/teachers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const subs = Array.isArray(subRes.data)
          ? subRes.data
          : subRes.data.items || subRes.data.data || [];
        const teacs = Array.isArray(teachRes.data)
          ? teachRes.data
          : teachRes.data.items || teachRes.data.data || [];
        setSubjectsList(subs);
        setTeachersList(teacs);
      } catch (err) {
        console.error("FETCH-LOOKUPS error", err);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLookups();
  }, [token]);

  // Load existing timetable
  useEffect(() => {
    const fetchTimeTable = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/api/TimeTable/all-table`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        const current = data.find((c) => c.classId?.toString() === classId);
        if (current?.timeSlots?.length) {
          const organized = {};
          current.timeSlots.forEach((slot) => {
            const day = slot.dayOfWeek;
            if (!organized[day]) organized[day] = [];
            const slotId =
              slot.id ??
              slot.timeSlotId ??
              slot.timeSlotID ??
              slot.timeSlotID ??
              slot.idTimeSlot;

            organized[day].push({
              id:
                slotId !== undefined
                  ? slotId.toString()
                  : `${day}-${slot.startTime}`,
              subjectId: slot.subjectId,
              teacherId: slot.teacherId,
              subjectName: slot.subjectName,
              teacherName: slot.teacherName,
              // normalize to HH:MM:SS
              startTime:
                slot.startTime.length === 5
                  ? `${slot.startTime}:00`
                  : slot.startTime,
              endTime:
                slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime,
            });
          });
          setSubjects(organized);
        }
      } catch (err) {
        console.error("FETCH-EXISTING-TT", err.response?.data || err.message);
      }
    };
    fetchTimeTable();
  }, [token, classId]);

  const handleAddOrUpdateSubject = async () => {
    if (!subject || !teacher || !startTime || !endTime) {
      return Alert.alert("Error", "All fields are required");
    }

    const startStr = validateTimeString(startTime);
    const endStr = validateTimeString(endTime);
    if (!startStr || !endStr) {
      return Alert.alert("Error", "Invalid time format. Use HH:MM[:SS]");
    }

    const [sh, sm] = startStr.split(":").map(Number);
    const [eh, em] = endStr.split(":").map(Number);
    const stM = sh * 60 + sm;
    const etM = eh * 60 + em;
    if (stM >= etM) {
      return Alert.alert("Error", "End time must be after start time");
    }

    const payload = {
      dayOfWeek: dayNameToNumber[selectedDay],
      startTime: startStr,
      endTime: endStr,
      subjectId: Number(subject),
      teacherId: Number(teacher),
      classroomId: Number(classId),
    };

    try {
      if (isEditing) {
        // PUT : edit existing slot
        await axios.put(
          `${API_BASE}/api/TimeTable/time-slot/${Number(editId)}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // POST : create new slot
        await axios.post(`${API_BASE}/api/TimeTable`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // update UI
      setSubjects((prev) => {
        const updated = { ...prev };
        const list = updated[selectedDay] ? [...updated[selectedDay]] : [];
        const newItem = {
          id: isEditing ? editId : Date.now().toString(),
          subjectId: Number(subject),
          teacherId: Number(teacher),
          subjectName:
            subjectsList.find((s) => s.id === Number(subject))?.name || "",
          teacherName:
            `${teachersList.find((t) => t.id === Number(teacher))?.firstName || ""} ${teachersList.find((t) => t.id === Number(teacher))?.lastName || ""}`.trim(),
          startTime: startStr,
          endTime: endStr,
        };
        updated[selectedDay] = isEditing
          ? list.map((i) => (i.id === editId ? newItem : i))
          : [...list, newItem];
        return updated;
      });

      resetModal();
    } catch (err) {
      console.error("SAVE-TIMESLOT error", err.response?.data || err.message);
      const errors = err.response?.data?.errors || {};
      if (errors["$.startTime"] || errors["$.endTime"]) {
        Alert.alert(
          "Invalid Time",
          "Server rejected time format. Please use HH:MM:SS"
        );
      } else if (errors.request) {
        Alert.alert("Error", "Request payload missing or malformed");
      } else {
        Alert.alert("Error", "Failed to save. Please try again.");
      }
    }
  };

  const handleEditSubject = (item) => {
    setSubject(item.subjectId != null ? String(item.subjectId) : null);
    setTeacher(item.teacherId != null ? String(item.teacherId) : null);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setEditId(item.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteSubject = (id) => {
    Alert.alert("Confirm Delete", "Delete this timeslot?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/api/TimeTable/time-slot/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setSubjects((prev) => ({
              ...prev,
              [selectedDay]: prev[selectedDay].filter((i) => i.id !== id),
            }));
          } catch (err) {
            console.error(
              "DELETE-TIMESLOT error",
              err.response?.data || err.message
            );
            Alert.alert("Error", "Failed to delete. Please try again.");
          }
        },
      },
    ]);
  };

  const resetModal = () => {
    setSubject(null);
    setTeacher(null);
    setStartTime("");
    setEndTime("");
    setIsEditing(false);
    setEditId(null);
    setModalVisible(false);
  };

  const handleSave = () => {
    console.log("Final timetable:", subjects);
    router.back();
  };

  const renderItem = ({ item }) => (
    <View style={styles.subjectItem}>
      <View>
        <Text style={styles.subjectText}>{item.subjectName}</Text>
        <Text style={styles.teacherText}>{item.teacherName}</Text>
        <Text style={styles.timeText}>
          {item.startTime} - {item.endTime}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => handleEditSubject(item)}>
          <Ionicons name="pencil" size={24} color="#007BFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteSubject(item.id)}>
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Class: {className}</Text>

      <View style={styles.dayPickerContainer}>
        <Text style={styles.label}>Select Day:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDay}
            onValueChange={setSelectedDay}
            style={styles.picker}
            itemStyle={{ color: "#333", fontFamily: "System" }}
          >
            {days.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Subject</Text>
      </TouchableOpacity>

      <FlatList
        data={subjects[selectedDay] || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit Subject" : "Add Subject"}
            </Text>

            <Text style={styles.label}>Subject:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={subject}
                onValueChange={setSubject}
                style={styles.picker}
                itemStyle={{ color: "#333", fontFamily: "System" }}
              >
                <Picker.Item label="Select Subject" value={null} />
                {subjectsList.map((s) => (
                  <Picker.Item
                    key={s.id}
                    label={s.name}
                    value={s.id.toString()}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Teacher:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={teacher}
                onValueChange={setTeacher}
                style={styles.picker}
                itemStyle={{ color: "#333", fontFamily: "System" }}
              >
                <Picker.Item label="Select Teacher" value={null} />
                {teachersList.map((t) => (
                  <Picker.Item
                    key={t.id}
                    label={`${t.firstName} ${t.lastName}`}
                    value={t.id.toString()}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Start Time:</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM:SS"
              placeholderTextColor="#999"
              keyboardType="default"
              value={startTime}
              onChangeText={(format) => setStartTime(formatTimeInput(format))}
              maxLength={8}
            />

            <Text style={styles.label}>End Time:</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM:SS"
              placeholderTextColor="#999"
              keyboardType="default"
              value={endTime}
              onChangeText={(format) => setEndTime(formatTimeInput(format))}
              maxLength={8}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddOrUpdateSubject}
              >
                <Text style={styles.modalButtonText}>
                  {isEditing ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Timetable</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "left",
    color: "#333",
    fontFamily: "System",
  },
  dayPickerContainer: { marginBottom: 20 },
  label: {
    fontSize: 20,
    marginBottom: 8,
    fontWeight: "700",
    color: "#333",
    fontFamily: "System",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#333",
    fontFamily: "System",
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "System",
  },
  subjectItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007BFF",
  },
  subjectText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  teacherText: {
    fontSize: 14,
    marginTop: 5,
    color: "#666",
    fontFamily: "System",
  },
  timeText: {
    fontSize: 14,
    marginTop: 5,
    color: "#666",
    fontWeight: "500",
    fontFamily: "System",
  },
  iconContainer: {
    flexDirection: "row",
    width: 65,
    justifyContent: "space-between",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
    fontFamily: "System",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#333",
    fontFamily: "System",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "System",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "System",
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "System",
  },
});

export default ClassTimetable;
