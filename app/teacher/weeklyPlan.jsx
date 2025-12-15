import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

const TeacherWeeklyPlan = () => {
  const { subjectId, classId } = useLocalSearchParams();
  const { token } = useAuth();

  /* header fields */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const formatDate = (d) => {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  /* per-day inputs */
  const [selectedDay, setSelectedDay] = useState("");
  const [classWork, setClassWork] = useState("");
  const [homeWork, setHomeWork] = useState("");
  const [requiredBooks, setRequiredBooks] = useState("");

  const [dailyPlans, setDailyPlans] = useState([]);

  const resetDayFields = () => {
    setSelectedDay("");
    setClassWork("");
    setHomeWork("");
    setRequiredBooks("");
  };

  const handleAddDay = () => {
    if (!selectedDay || !classWork || !homeWork || !requiredBooks) {
      return Alert.alert("Error", "Please fill all day fields");
    }
    // Prevent duplicate day entries -> replace existing
    setDailyPlans((prev) => {
      const filtered = prev.filter((dp) => dp.day !== selectedDay);
      return [
        ...filtered,
        { day: selectedDay, classWork, homeWork, requiredBooks },
      ];
    });
    resetDayFields();
  };

  const handleRemoveDay = (day) => {
    setDailyPlans((prev) => prev.filter((d) => d.day !== day));
  };

  const canSave =
    dailyPlans.length > 0 && fromDate && toDate && subjectId && classId;

  const handleSave = async () => {
    if (!canSave) return;

    try {
      await axios.post(
        `${API_BASE}/api/weeklyplans`,
        {
          subjectId: Number(subjectId),
          classId: Number(classId),
          fromDate,
          toDate,
          stage: "",
          dailyPlans: dailyPlans.sort(
            (a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day)
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      Alert.alert("Success", "Weekly plan saved successfully");
      router.back();
    } catch (err) {
      console.error("SAVE-WEEKLY-PLAN", err.response?.data || err.message);
      Alert.alert("Error", "Failed to save weekly plan");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header inputs */}
      <Text style={styles.label}>Select Date Range</Text>
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.dateText}>{fromDate || "From Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.dateText}>{toDate || "To Date"}</Text>
        </TouchableOpacity>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate ? new Date(fromDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(e, selected) => {
            setShowFromPicker(false);
            if (selected) {
              setFromDate(formatDate(selected));
            }
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate ? new Date(toDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(e, selected) => {
            setShowToPicker(false);
            if (selected) {
              setToDate(formatDate(selected));
            }
          }}
        />
      )}

      {/* Day entry section */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Daily Plan</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDay}
          onValueChange={setSelectedDay}
          style={styles.picker}
          itemStyle={{ color: "#333", fontFamily: "System" }}
        >
          <Picker.Item label="Select Day" value="" />
          {daysOfWeek.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Class Work"
        placeholderTextColor="#999"
        value={classWork}
        onChangeText={setClassWork}
      />
      <TextInput
        style={styles.input}
        placeholder="Home Work"
        placeholderTextColor="#999"
        value={homeWork}
        onChangeText={setHomeWork}
      />
      <TextInput
        style={styles.input}
        placeholder="Required Books"
        placeholderTextColor="#999"
        value={requiredBooks}
        onChangeText={setRequiredBooks}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddDay}>
        <Text style={styles.addButtonText}>Add Day Plan</Text>
      </TouchableOpacity>

      {/* List added days */}
      {dailyPlans.length > 0 && (
        <View style={{ marginTop: 20, width: "100%" }}>
          <Text style={styles.sectionTitle}>Days Added</Text>
          {dailyPlans
            .sort(
              (a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day)
            )
            .map((item) => (
              <View key={item.day} style={styles.dayItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayTitle}>{item.day}</Text>
                  <Text>
                    <Text style={styles.dayTitle}>CW:</Text> {item.classWork}
                  </Text>
                  <Text>
                    <Text style={styles.dayTitle}>HW:</Text> {item.homeWork}
                  </Text>
                  <Text>
                    <Text style={styles.dayTitle}>Books:</Text>{" "}
                    {item.requiredBooks}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveDay(item.day)}
                >
                  <Text style={{ color: "#fff" }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { opacity: canSave ? 1 : 0.4 }]}
        disabled={!canSave}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Weekly Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TeacherWeeklyPlan;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    fontFamily: "System",
  },
  label: {
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 18,
    color: "#333",
    fontFamily: "System",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    width: "100%",
    color: "#333",
    fontFamily: "System",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    fontFamily: "System",
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "System",
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dayTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontFamily: "System",
  },
  removeBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "System",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 3,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
});
