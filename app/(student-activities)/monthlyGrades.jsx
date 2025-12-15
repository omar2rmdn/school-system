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

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = ["2023", "2024", "2025", "2026"];

const StudentMonthlyGrades = () => {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const studentId = params.studentId;
  const studentName = params.studentName;
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedTerm, setSelectedTerm] = useState("term1");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const monthNum = months.indexOf(selectedMonth) + 1; // 1-12

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE}/api/MonthlyGrades/student/${studentId}?month=${monthNum}&year=${selectedYear}&term=${selectedTerm}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = Array.isArray(res.data) ? res.data : [res.data];
      setResults(payload.filter((item) => item && item.subjectName)); // Filter out null/empty results

      if (payload.length === 0) {
        Alert.alert("No Data", "No grades found for the selected period");
      }
    } catch (err) {
      console.error("FETCH-MONTHLY-GRADES", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch grades");
    } finally {
      setLoading(false);
    }
  };

  const fetchAndGeneratePDF = async () => {
    if (!studentId || !token) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    setIsGenerating(true);

    try {
      // First fetch the data
      setLoading(true);
      const url = `${API_BASE}/api/MonthlyGrades/student/${studentId}?month=${monthNum}&year=${selectedYear}&term=${selectedTerm}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = Array.isArray(res.data) ? res.data : [res.data];
      const fetchedResults = payload.filter((item) => item && item.subjectName);

      if (fetchedResults.length === 0) {
        Alert.alert("No Data", "No grades found for the selected period");
        return;
      }

      setResults(fetchedResults);
      setLoading(false);

      // Then generate PDF with the fetched data
      await generatePDFWithData(fetchedResults);
    } catch (err) {
      console.error("FETCH-MONTHLY-GRADES", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch grades");
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const generatePDFWithData = async (dataResults) => {
    try {
      const stuName = dataResults[0]?.studentName || studentName || "Student";
      const termDisplay =
        selectedTerm === "term1" ? "First Term" : "Second Term";

      // Calculate total grades across all subjects
      const totalPoints = dataResults.reduce(
        (sum, result) => sum + (result.total || 0),
        0
      );
      const maxPossible = dataResults.length * 40; // 40 points max per subject
      const percentage = ((totalPoints / maxPossible) * 100).toFixed(1);

      // Generate table rows for all subjects
      const tableRows = dataResults
        .map(
          (result, index) => `
        <tr style="background-color:${index % 2 === 0 ? "#f9f9f9" : "#fff"};">
          <td>${result.subjectName}</td>
          <td>${result.monthWork}</td>
          <td>${result.exam}</td>
          <td>${result.tasks}</td>
          <td>${result.attitudeAndConduct}</td>
          <td style="font-weight:bold;color:#0b4d91;">${result.total}</td>
        </tr>
      `
        )
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
          <h2 style="font-size: 30px; margin-bottom: 10px;">Monthly Grades Report</h2>
          
          <div class='info'>
            <p><strong>Student Name:</strong> ${stuName}</p>
            <p><strong>Period:</strong> ${selectedMonth} ${selectedYear}</p>
            <p><strong>Term:</strong> ${termDisplay}</p>
            <p><strong>Subjects Count:</strong> ${dataResults.length}</p>
          </div>
          
          <table>
            <tr>
              <th>Subject</th>
              <th>Month Work<br/>(Max: 15)</th>
              <th>Exam<br/>(Max: 10)</th>
              <th>Tasks<br/>(Max: 10)</th>
              <th>Attitude<br/>(Max: 5)</th>
              <th>Total<br/>(Max: 40)</th>
            </tr>
            ${tableRows}
          </table>
          
          <div class='summary'>
            <h3 style="color: #0b4d91; margin: 0 0 10px 0;">Overall Performance</h3>
            <p><strong>Total Points:</strong> ${totalPoints} / ${maxPossible}</p>
            <p><strong>Percentage:</strong> ${percentage}%</p>
            <p><strong>Grade:</strong> ${percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : "D"}</p>
          </div>
          
          <div class='footer'>
            <div class='signature'><p>Date: ${new Date().toLocaleDateString()}</p></div>
            <div class='signature'><p>School Administration</p></div>
          </div>
        </div>
      </body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      const fileName = `MonthlyGrades_${stuName.replace(/\s+/g, "_")}_${selectedMonth}_${selectedYear}.pdf`;
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
      console.error("PDF", e);
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

        <Text style={styles.label}>Select Month:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            style={styles.picker}
            itemStyle={{ color: "#333", fontFamily: "System" }}
          >
            {months.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Term:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTerm}
            onValueChange={setSelectedTerm}
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
  scrollContainer: { padding: 20, flex: 1 },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    fontFamily: "System",
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
    color: "#333",
    fontFamily: "System",
  },
  button: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    position: "absolute",
    top: 330,
    left: 20,
    right: 20,
  },
});

export default StudentMonthlyGrades;
