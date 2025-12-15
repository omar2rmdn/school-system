import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { API_BASE, useAuth } from "../../context/AuthContext";

const years = ["2023", "2024", "2025", "2026"];

const StudentFinalResult = () => {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const studentId = params.studentId;
  const studentName = params.studentName || "";
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedTerm, setSelectedTerm] = useState("term1");
  const [gradesData, setGradesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAndGeneratePDF = async () => {
    if (!studentId || !token) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    setIsGenerating(true);

    try {
      // First fetch the data
      setLoading(true);
      const url = `${API_BASE}/api/Grades/student/${studentId}/term?term=${selectedTerm}&year=${selectedYear}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data || !res.data.grades || res.data.grades.length === 0) {
        Alert.alert("No Data", "No final grades found for the selected period");
        return;
      }

      setGradesData(res.data);
      setLoading(false);

      // Then generate PDF with the fetched data
      await generatePDFWithData(res.data);
    } catch (err) {
      console.error("FETCH-FINAL-GRADES", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch grades");
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const generatePDFWithData = async (dataGrades) => {
    try {
      const grades = dataGrades.grades || [];
      const termDisplay =
        selectedTerm === "term1"
          ? "First Term"
          : selectedTerm === "term2"
            ? "Second Term"
            : "Third Term";

      // Calculate totals and statistics
      const totalPoints = grades.reduce(
        (sum, grade) => sum + (grade.totalDegree || 0),
        0
      );
      const maxPossible = grades.length * 100; // Assuming 100 points max per subject
      const percentage = ((totalPoints / maxPossible) * 100).toFixed(1);
      const averageGrade = (totalPoints / grades.length).toFixed(1);

      // Generate legend
      const legend = `
        <div style="margin:20px 0;font-size:16px;">
          <strong>Grade Legend:</strong>
          <div style="display:flex;gap:20px;margin-top:8px;align-items:center;">
            <span style="width:20px;height:20px;background:#0b4d91;border:1px solid #000;display:inline-block;"></span> 90-100
            <span style="width:20px;height:20px;background:#28a745;border:1px solid #000;display:inline-block;"></span> 80-89
            <span style="width:20px;height:20px;background:#ffc107;border:1px solid #000;display:inline-block;"></span> 70-79
            <span style="width:20px;height:20px;background:#dc3545;border:1px solid #000;display:inline-block;"></span> Below 70
          </div>
        </div>`;

      // Generate table rows with color-coded cells (no numbers)
      const tableRows = grades
        .map((grade, index) => {
          const total = grade.totalDegree || 0;
          let bg = "#dc3545"; // default red
          if (total >= 90)
            bg = "#0b4d91"; // blue
          else if (total >= 80)
            bg = "#28a745"; // green
          else if (total >= 70) bg = "#ffc107"; // yellow
          return `
        <tr style="background-color:${index % 2 === 0 ? "#f9f9f9" : "#fff"};">
          <td>${grade.subjectName}</td>
          <td>${grade.yearWorkDegree}</td>
          <td>${grade.finalExamDegree}</td>
          <td style="background:${bg};padding:12px;"></td>
        </tr>`;
        })
        .join("");

      const parentFullName = dataGrades.parentName || params.parentName || "";

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
          font-size: 40px;
        }
        h2 {
          text-align: center;
          margin-top: 0;
          color: #555;
          font-size: 30px;
          margin-bottom: 10px;
        }
        .info {
          margin: 20px 0;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
          font-size: 16px;
        }
        th {
          background: #0b4d91;
          color: #fff;
          font-weight: bold;
        }
        .summary {
          background: #f0f8ff;
          border: 2px solid #0b4d91;
          padding: 15px;
          margin: 20px 0;
          border-radius: 8px;
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
      </style></head><body>
        <div class='cert'>
          <h1 style="font-size: 40px;">Heroes Elementary School</h1>
          <h2 style="font-size: 30px; margin-bottom: 10px;">Final Grades Report</h2>
          
          <div class='info'>
            <p><strong>Student Name:</strong> ${dataGrades.studentName || studentName} ${parentFullName}</p>
            <p><strong>Academic Year:</strong> ${dataGrades.year}</p>
            <p><strong>Term:</strong> ${termDisplay}</p>
          </div>
          
          <table>
            <tr>
              <th>Subject</th>
              <th>Year Work<br/>(Max: 40)</th>
              <th>Final Exam<br/>(Max: 60)</th>
              <th>Performance</th>
            </tr>
            ${tableRows}
          </table>
          ${legend}
          
          <div class='footer'>
            <div class='signature'><p>Date: ${new Date().toLocaleDateString()}</p></div>
            <div class='signature'><p>School Administration</p></div>
          </div>
        </div>
      </body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      const fileName = `FinalGrades_${(dataGrades.studentName || studentName).replace(/\s+/g, "_")}_${termDisplay.replace(/\s+/g, "_")}_${dataGrades.year}.pdf`;
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
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Select Year:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
            style={styles.picker}
            itemStyle={{ color: "#333", fontFamily: "System" }}
          >
            {years.map((y) => (
              <Picker.Item key={y} label={y} value={y} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Term:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTerm}
            onValueChange={(itemValue) => setSelectedTerm(itemValue)}
            style={styles.picker}
            itemStyle={{ color: "#333", fontFamily: "System" }}
          >
            <Picker.Item label="Term 1" value="term1" />
            <Picker.Item label="Term 2" value="term2" />
          </Picker>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={fetchAndGeneratePDF}
        style={[styles.button, { marginTop: 40 }]}
        loading={isGenerating || loading}
        disabled={isGenerating || loading}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          {loading
            ? "Loading..."
            : isGenerating
              ? "Generating..."
              : "Download Certificate"}
        </Text>
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { padding: 20, position: "relative", flex: 1 },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerContainer: {
    borderRadius: 5,
    backgroundColor: "white",
    marginBottom: 30,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.19,
    shadowRadius: 5.62,
    elevation: 6,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
    fontFamily: "System",
  },
  button: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    position: "absolute",
    top: 210,
    left: 20,
    right: 20,
  },
});

export default StudentFinalResult;
