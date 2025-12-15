import axios from "axios";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import { shareAsync } from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const StudentTimeTable = () => {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const studentId = params.studentId;

  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!studentId) return;
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/api/TimeTable/my-student-schedule/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setScheduleData(res.data);
      } catch (err) {
        console.error("FETCH-SCHEDULE", err.response?.data || err.message);
        Alert.alert("Error", "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [studentId, token]);

  const generatePDF = async () => {
    if (!scheduleData) return;
    const { studentName, classroomName, schedule } = scheduleData;

    const tableRows = schedule
      .map((dayItem) => {
        const { day, slots } = dayItem;
        return slots
          .map((slot, idx) => {
            const row = `
            ${idx === 0 ? `<td rowspan="${slots.length}">${day}</td>` : ""}
            <td>${slot.startTime}</td>
            <td>${slot.endTime}</td>
            <td>${slot.subjectName}</td>
            <td>${slot.teacherName}</td>
          `;
            return `<tr>${row}</tr>`;
          })
          .join("");
      })
      .join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { text-align: center; color: #007BFF; }
            h3 { text-align: center; margin-top: 4px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #007BFF; padding: 8px; text-align: center; font-size: 12px; }
            th { background: #007BFF; color: #fff; }
          </style>
        </head>
        <body>
          <h1>${studentName}'s Weekly Schedule</h1>
          <h3>Class: ${classroomName}</h3>
          <table>
            <tr>
              <th>Day</th>
              <th>Start</th>
              <th>End</th>
              <th>Subject</th>
              <th>Teacher</th>
            </tr>
            ${tableRows}
          </table>
        </body>
      </html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await shareAsync(uri, {
        UTI: "com.adobe.pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("PDF-GEN", error);
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={generatePDF}
        disabled={!scheduleData}
      >
        <Text style={styles.buttonText}>Download Time Table</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StudentTimeTable;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
