import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { SafeView } from "@/components/common/safe-view";
import { useStudentStore } from "@/store/student";
import { useStudentFinalGrades } from "@/queries/grades";
import { useSubjects } from "@/queries/subjects";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { getGradeColor } from "@/utils";
import { DashboardList } from "@/components/cards/dashboard-list";
import { GradeItem } from "@/components/list-items";
import { FinalGrade } from "@/types";

export default function Grades() {
  const { selectedStudentId } = useStudentStore();
  const { data: finalGrades, isLoading } =
    useStudentFinalGrades(selectedStudentId);
  const { data: subjects } = useSubjects();

  const [selectedTerm, setSelectedTerm] = useState<"first" | "second" | null>(
    null,
  );
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showTermPicker, setShowTermPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const termOptions: Array<"first" | "second"> = ["first", "second"];

  const availableTerms = (() => {
    if (!finalGrades) return [];
    const terms = new Set(finalGrades.map((g) => g.term));
    return termOptions.filter((term) => terms.has(term));
  })();

  const availableYears = (() => {
    if (!finalGrades) return [];
    const years = new Set(finalGrades.map((g) => g.academicYear));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  })();

  const filteredGrades = (() => {
    if (!finalGrades) return [];
    return finalGrades.filter((grade) => {
      const matchTerm = selectedTerm === null || grade.term === selectedTerm;
      const matchYear =
        selectedYear === null || grade.academicYear === selectedYear;
      return matchTerm && matchYear;
    });
  })();


  const clearFilters = () => {
    setSelectedTerm(null);
    setSelectedYear(null);
  };

  const renderGradeItem = ({ item }: { item: FinalGrade }) => {
    const subjectId =
      typeof item.subject === "string" ? item.subject : item.subject._id;
    const subjectTitle =
      typeof item.subject === "string"
        ? subjects?.find((subject) => subject._id === subjectId)?.title ||
          "Unknown Subject"
        : item.subject?.name ||
          item.subject?.title ||
          subjects?.find((subject) => subject._id === subjectId)?.title ||
          "Unknown Subject";

    return (
      <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100 flex-row items-center">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-800 mb-1">
            {subjectTitle}
          </Text>
          <Text className="text-sm text-slate-500">
            {item.academicYear} •{" "}
            {item.term === "first" ? "First Term" : "Second Term"}
          </Text>
        </View>
        <View
          className={`w-14 h-14 rounded-full items-center justify-center ml-4 ${
            getGradeColor(item.score).split(" ")[1]
          }`}
        >
          <Text
            className={`text-lg font-bold ${getGradeColor(item.score).split(" ")[0]}`}
          >
            {item.score}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeView className="flex-1 bg-slate-50">
      {selectedStudentId && finalGrades && finalGrades.length > 0 && (
        <View className="px-4 pb-4 border-b border-slate-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Filter Records
            </Text>
            {(selectedTerm !== null || selectedYear !== null) && (
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-sm text-emerald-600 font-medium">
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row gap-x-3">
            <View className="flex-1">
              <Text className="text-xs text-slate-500 mb-1">Academic Year</Text>
              <TouchableOpacity
                onPress={() => setShowYearPicker(true)}
                className="flex-row items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm"
              >
                <Text
                  className={`text-sm ${selectedYear ? "text-slate-800 font-medium" : "text-slate-400"}`}
                >
                  {selectedYear || "All Years"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <Text className="text-xs text-slate-500 mb-1">Term</Text>
              <TouchableOpacity
                onPress={() => setShowTermPicker(true)}
                className="flex-row items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm"
              >
                <Text
                  className={`text-sm ${selectedTerm ? "text-slate-800 font-medium" : "text-slate-400"}`}
                >
                  {selectedTerm
                    ? selectedTerm === "first"
                      ? "First Term"
                      : "Second Term"
                    : "All Terms"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {!selectedStudentId ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="people-outline" size={64} color="#cbd5e1" />
          <Text className="text-lg text-slate-500 mt-4 text-center">
            Please select a student from the home screen first.
          </Text>
        </View>
      ) : (
        <DashboardList
          variant="list"
          data={filteredGrades}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <GradeItem item={item} subjects={subjects} />}
          isLoading={isLoading}
          emptyIcon="school-outline"
          emptyMessage="No final grades found for this student."
        />
      )}

      <Modal visible={showYearPicker} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View className="bg-white rounded-t-2xl max-h-96">
            <View className="p-4 border-b border-slate-100 flex-row justify-between items-center bg-slate-50 rounded-t-2xl">
              <Text className="text-lg font-bold text-slate-800">
                Select Academic Year
              </Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              <TouchableOpacity
                className="py-3 border-b border-slate-100 flex-row items-center justify-between"
                onPress={() => {
                  setSelectedYear(null);
                  setShowYearPicker(false);
                }}
              >
                <Text
                  className={`text-base ${selectedYear === null ? "font-bold text-emerald-600" : "text-slate-700"}`}
                >
                  All Years
                </Text>
                {selectedYear === null && (
                  <Ionicons name="checkmark" size={20} color="#059669" />
                )}
              </TouchableOpacity>
              {availableYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  className="py-3 border-b border-slate-100 flex-row items-center justify-between"
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text
                    className={`text-base ${selectedYear === year ? "font-bold text-emerald-600" : "text-slate-700"}`}
                  >
                    {year}
                  </Text>
                  {selectedYear === year && (
                    <Ionicons name="checkmark" size={20} color="#059669" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showTermPicker} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowTermPicker(false)}
        >
          <View className="bg-white rounded-t-2xl max-h-96">
            <View className="p-4 border-b border-slate-100 flex-row justify-between items-center bg-slate-50 rounded-t-2xl">
              <Text className="text-lg font-bold text-slate-800">
                Select Term
              </Text>
              <TouchableOpacity onPress={() => setShowTermPicker(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              <TouchableOpacity
                className="py-3 border-b border-slate-100 flex-row items-center justify-between"
                onPress={() => {
                  setSelectedTerm(null);
                  setShowTermPicker(false);
                }}
              >
                <Text
                  className={`text-base ${selectedTerm === null ? "font-bold text-emerald-600" : "text-slate-700"}`}
                >
                  All Terms
                </Text>
                {selectedTerm === null && (
                  <Ionicons name="checkmark" size={20} color="#059669" />
                )}
              </TouchableOpacity>
              {availableTerms.map((term) => (
                <TouchableOpacity
                  key={term}
                  className="py-3 border-b border-slate-100 flex-row items-center justify-between"
                  onPress={() => {
                    setSelectedTerm(term);
                    setShowTermPicker(false);
                  }}
                >
                  <Text
                    className={`text-base ${selectedTerm === term ? "font-bold text-emerald-600" : "text-slate-700"}`}
                  >
                    {term === "first" ? "First Term" : "Second Term"}
                  </Text>
                  {selectedTerm === term && (
                    <Ionicons name="checkmark" size={20} color="#059669" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeView>
  );
}
