import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { API_BASE, useAuth } from "../../context/AuthContext";

const WeeklyPlanScreen = () => {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const studentId = params.studentId;
  const studentName = params.studentName;

  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAndGeneratePDF = async () => {
    if (!studentId || !token) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch student subjects
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

      // Fetch weekly plans for all subjects (without date filtering)
      const allPlans = [];
      for (const subject of subjectsData) {
        try {
          const subjectId = subject.id || subject.subjectId;
          const classId = subject.classId || "1001";

          const planRes = await axios.get(
            `${API_BASE}/api/weeklyplans/subject/${subjectId}/class/${classId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (planRes.data) allPlans.push(planRes.data);
        } catch (err) {
          console.error(
            `Failed to fetch plan for subject ${subject.name}:`,
            err.response?.data || err.message
          );
        }
      }

      if (allPlans.length === 0) {
        Alert.alert("No Data", "No weekly plans found for this student");
        return;
      }

      // Filter plans based on current date being within fromDate and toDate range
      const currentDate = new Date();
      const activePlans = allPlans.filter((plan) => {
        if (!plan.fromDate || !plan.toDate) {
          return false; // Skip plans without proper date range
        }

        const fromDate = new Date(plan.fromDate);
        const toDate = new Date(plan.toDate);

        // Check if current date is within the plan's date range (inclusive)
        return currentDate >= fromDate && currentDate <= toDate;
      });

      if (activePlans.length === 0) {
        Alert.alert(
          "No Active Plans",
          "No weekly plans are currently active for this student"
        );
        return;
      }

      // Generate PDF with filtered active plans
      await generatePDFWithData(activePlans);
    } catch (err) {
      console.error(
        "FETCH-ALL-WEEKLY-PLANS",
        err.response?.data || err.message
      );
      Alert.alert("Error", "Failed to load weekly plans");
      setIsGenerating(false);
    }
  };

  const generatePDFWithData = async (plans) => {
    try {
      const subjectTables = plans
        .map((plan, planIndex) => {
          const tableRows = (plan.dailyPlans || [])
            .map(
              (d, idx) => `
            <tr style="background-color:${idx % 2 === 0 ? "#f9f9f9" : "#fff"};">
              <td>${d.day}</td>
              <td>${d.classWork}</td>
              <td>${d.homeWork}</td>
              <td>${d.requiredBooks}</td>
            </tr>`
            )
            .join("");

          return `
          <div style="margin-bottom: 20px; ${planIndex % 2 === 0 && planIndex !== 0 ? "page-break-before: always;" : ""}">
            <h3 style="color: #0b4d91; margin-bottom: 12px; font-size: 30px;">
              ${plan.subjectName} - Class ${plan.className}
            </h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:15px;font-size:20px;">
              <tr>
                <th style="background:#0b4d91;color:#fff;border:1px solid #ddd;padding:8px;text-align:center;">Day</th>
                <th style="background:#0b4d91;color:#fff;border:1px solid #ddd;padding:8px;text-align:center;">Class Work</th>
                <th style="background:#0b4d91;color:#fff;border:1px solid #ddd;padding:8px;text-align:center;">Home Work</th>
                <th style="background:#0b4d91;color:#fff;border:1px solid #ddd;padding:8px;text-align:center;">Required Books</th>
              </tr>
              ${tableRows}
            </table>
          </div>
        `;
        })
        .join("");

      const html = `<!DOCTYPE html><html><head><meta charset='utf-8'/><style>
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
          font-size: 28px;
        }
        h2 {
          text-align: center;
          margin-top: 0;
          color: #555;
          font-size: 24px;
        }
        h3 {
          color: #0b4d91;
          margin-bottom: 12px;
          font-size: 22px;
        }
        .info {
          margin: 20px 0;
          font-size: 16px;
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
          <h2 style="font-size: 30px; margin-bottom: 10px;">Weekly Plans Report</h2>
          
          <div class='info'>
            <p><strong>Student Name:</strong> ${studentName || "Student"}</p>
            <p><strong>Generated Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Subjects Count:</strong> ${plans.length}</p>
          </div>
          
          ${subjectTables}
          <div class='footer'>
            <div class='signature'><p>Date: ${new Date().toLocaleDateString()}</p></div>
            <div class='signature'><p>School Administration</p></div>
          </div>
        </div>
      </body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      const fileName = `WeeklyPlans_${studentName?.replace(/\s+/g, "_") || "Student"}_${new Date().toISOString().split("T")[0]}.pdf`;
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
    } catch (e) {
      console.error("PDF Generation Error", e);
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={fetchAndGeneratePDF}
        style={styles.downloadBtn}
        loading={isGenerating}
        disabled={isGenerating}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          {isGenerating ? "Generating..." : "Download Weekly Plans"}
        </Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtn: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    width: "100%",
    maxWidth: 300,
  },
});

export default WeeklyPlanScreen;
