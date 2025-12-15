import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const SubjectSummary = () => {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const studentId = params.studentId;
  const studentName = params.studentName;

  const [todayData, setTodayData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current day name
  const getCurrentDay = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    return days[today.getDay()];
  };

  useEffect(() => {
    const fetchTodayPlans = async () => {
      if (!studentId || !token) return;

      try {
        setLoading(true);
        const currentDay = getCurrentDay();

        // First, get all subjects assigned to the student
        const subjectsRes = await axios.get(
          `${API_BASE}/api/students/student/${studentId}/subjects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const subjectsData = Array.isArray(subjectsRes.data)
          ? subjectsRes.data
          : subjectsRes.data.items || subjectsRes.data.data || [];

        if (subjectsData.length === 0) {
          Alert.alert("No Data", "No subjects found for this student");
          return;
        }

        // Now fetch weekly plan for each subject and extract today's data
        const todayPlans = [];
        for (const subject of subjectsData) {
          try {
            const subjectId = subject.id || subject.subjectId;
            const classId = subject.classId || "1001";

            const planRes = await axios.get(
              `${API_BASE}/api/weeklyplans/subject/${subjectId}/class/${classId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (planRes.data && planRes.data.dailyPlans) {
              const todayPlan = planRes.data.dailyPlans.find(
                (day) => day.day === currentDay
              );

              if (todayPlan) {
                todayPlans.push({
                  subjectName: planRes.data.subjectName,
                  className: planRes.data.className,
                  day: currentDay,
                  ...todayPlan,
                });
              }
            }
          } catch (err) {
            console.error(
              `Failed to fetch plan for subject ${subject.name}:`,
              err.response?.data || err.message
            );
            // Continue with other subjects even if one fails
          }
        }

        setTodayData(todayPlans);
      } catch (err) {
        console.error("FETCH-TODAY-PLANS", err.response?.data || err.message);
        Alert.alert("Error", "Failed to load today's plans");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayPlans();
  }, [studentId, token]);

  const generatePDF = async () => {
    if (!todayData || todayData.length === 0) {
      Alert.alert("Error", "No data available for today");
      return;
    }

    const currentDay = getCurrentDay();

    // Generate tables for each subject
    const subjectTables = todayData
      .map((plan, planIndex) => {
        return `
        <div style="margin-bottom: 15px; ${planIndex % 4 === 0 && planIndex !== 0 ? "page-break-before: always;" : ""}">
          <h3 style="color: #0b4d91; margin-bottom: 8px; font-size: 22px;">
            ${plan.subjectName} - Class ${plan.className}
          </h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px;font-size:16px;">
            <tr>
              <th style="background:#0b4d91;color:#fff;border:1px solid #ddd;padding:6px;text-align:center;font-size:14px;">Day</th>
              <th style="background:#0b4d91;color:#fff;border:1px solid #ddd;padding:6px;text-align:center;font-size:14px;">Class Work</th>
              <th style="background:#0b4d91;color:#fff;border:1px solid #ddd;padding:6px;text-align:center;font-size:14px;">Home Work</th>
              <th style="background:#0b4d91;color:#fff;border:1px solid #ddd;padding:6px;text-align:center;font-size:14px;">Required Books</th>
            </tr>
            <tr>
              <td style="border:1px solid #ddd;padding:6px;text-align:center;font-size:16px;">${plan.day}</td>
              <td style="border:1px solid #ddd;padding:6px;text-align:center;font-size:16px;">${plan.classWork}</td>
              <td style="border:1px solid #ddd;padding:6px;text-align:center;font-size:16px;">${plan.homeWork}</td>
              <td style="border:1px solid #ddd;padding:6px;text-align:center;font-size:16px;">${plan.requiredBooks}</td>
            </tr>
          </table>
        </div>
      `;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html><html><head><meta charset='utf-8'/><style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          padding: 40px;
          background: #f5f5f5;
          color: #333;
          font-size: 18px;
        }
        .cert {
          background: #fff;
          border: 10px solid #0b4d91;
          padding: 30px;
          max-width: 900px;
          margin: 0 auto;
        }
        h1 {
          color: #0b4d91;
          text-align: center;
          margin-bottom: 10px;
          font-size: 40px;
        }
        h2 {
          text-align: center;
          margin-top: 0;
          color: #555;
          font-size: 30px;
          margin-bottom: 10px;
        }
        h3 {
          color: #0b4d91;
          margin-bottom: 12px;
          font-size: 30px;
        }
        td, th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
          font-size: 20px;
        }
        .footer {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .signature {
          text-align: center;
          border-top: 2px solid #000;
          width: 250px;
          padding-top: 12px;
          font-size: 18px;
        }
        @media print { .page-break { page-break-before: always; } }
      </style></head><body>
        <div class='cert'>
          <h1 style="font-size: 40px;">Heroes Elementary School</h1>
          <h2 style="font-size: 30px; margin-bottom: 10px;">Today&apos;s Subject Summary - ${currentDay}</h2>
          ${subjectTables}
          <div class='footer'>
            <div class='signature'><p>Date: ${new Date().toLocaleDateString()}</p></div>
            <div class='signature'><p>School Administration</p></div>
          </div>
        </div>
      </body></html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const fileName = `TodaySubjectSummary_${getCurrentDay()}_${new Date().toISOString().split("T")[0]}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      Alert.alert("Download Complete", `PDF saved as ${fileName}`);

      if (Platform.OS === "android") {
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Loading today&apos;s plans...</Text>
      </View>
    );
  }

  if (!todayData || todayData.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No plans found for {getCurrentDay()}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText}>
          Download {getCurrentDay()}&apos;s Summary
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SubjectSummary;

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
  preview: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    maxWidth: "80%",
    alignItems: "center",
  },
  previewTitle: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  previewSubtitle: {
    color: "#555",
    fontSize: 16,
    marginBottom: 20,
  },
  previewText: {
    color: "#333",
    fontSize: 14,
    marginBottom: 6,
  },
  dayHeader: {
    color: "#007BFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subjectCount: {
    color: "#555",
    fontSize: 16,
    marginBottom: 20,
  },
  subjectPreview: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    maxWidth: "80%",
    alignItems: "center",
  },
});
