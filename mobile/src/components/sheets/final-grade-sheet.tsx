import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AxiosError } from "axios";
import React, { forwardRef, useEffect, useState } from "react";
import BottomSheetTemplate from "@/components/templates/bottom-sheet";
import { BottomSheetMethods } from "@/components/templates/bottom-sheet/types";
import { FinalGrade } from "@/types";
import { useCreateFinalGrade, useUpdateFinalGrade } from "@/queries/grades";

interface FinalGradeSheetProps {
  student: { _id: string; firstName: string; lastName: string } | null;
  existingGrade: FinalGrade | null;
  selectedSubjectId: string | null;
  onSuccess?: () => void;
}

export const FinalGradeSheet = forwardRef<
  BottomSheetMethods,
  FinalGradeSheetProps
>(({ student, existingGrade, selectedSubjectId, onSuccess }, ref) => {
  const createGradeMutation = useCreateFinalGrade();
  const updateGradeMutation = useUpdateFinalGrade();

  const [academicYear, setAcademicYear] = useState(
    String(new Date().getFullYear()),
  );
  const [term, setTerm] = useState<"first" | "second">("first");
  const [gradeValue, setGradeValue] = useState("");

  useEffect(() => {
    if (existingGrade) {
      setAcademicYear(
        existingGrade.academicYear || String(new Date().getFullYear()),
      );
      setTerm(existingGrade.term === "second" ? "second" : "first");
      setGradeValue(
        existingGrade.score === undefined ? "" : String(existingGrade.score),
      );
    } else {
      setAcademicYear(String(new Date().getFullYear()));
      setTerm("first");
      setGradeValue("");
    }
  }, [existingGrade, student]);

  const handleError = (error: unknown, fallbackMessage: string) => {
    if (error instanceof AxiosError) {
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : fallbackMessage;

      Alert.alert("Error", message);
      return;
    }

    Alert.alert("Error", fallbackMessage);
  };

  const trimmedAcademicYear = academicYear.trim();
  const isEditingSameRecord =
    !!existingGrade &&
    !!existingGrade._id &&
    existingGrade.academicYear === trimmedAcademicYear &&
    existingGrade.term === term;

  const handleSubmit = () => {
    if (!student || !selectedSubjectId) return;

    if (!trimmedAcademicYear) {
      Alert.alert("Error", "Please enter an academic year");
      return;
    }

    const parsedGrade = parseFloat(gradeValue);
    if (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100) {
      Alert.alert("Error", "Please enter a final grade between 0 and 100");
      return;
    }

    if (isEditingSameRecord && existingGrade) {
      updateGradeMutation.mutate(
        {
          id: existingGrade._id,
          data: {
            academicYear: trimmedAcademicYear,
            term,
            score: parsedGrade,
          },
        },
        {
          onSuccess: () => {
            if (ref && typeof ref !== "function" && ref.current) {
              ref.current.close();
            }
            Alert.alert("Success", "Grade updated successfully");
            onSuccess?.();
          },
          onError: (error) => {
            handleError(error, "Failed to update grade");
          },
        },
      );
    } else {
      createGradeMutation.mutate(
        {
          student: student._id,
          subject: selectedSubjectId,
          academicYear: trimmedAcademicYear,
          term,
          score: parsedGrade,
        },
        {
          onSuccess: () => {
            if (ref && typeof ref !== "function" && ref.current) {
              ref.current.close();
            }
            Alert.alert("Success", "Grade added successfully");
            onSuccess?.();
          },
          onError: (error) => {
            handleError(error, "Failed to add grade");
          },
        },
      );
    }
  };

  return (
    <BottomSheetTemplate
      ref={ref}
      snapPoints={["60%", "90%"]}
      enableBackdrop={true}
      backgroundColor="#f8fafc"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <View className="mb-6">
            <Text className="text-xl font-bold text-slate-800">
              {isEditingSameRecord ? "Edit Grade" : "Add Grade"}
            </Text>
            {student && (
              <Text className="text-base text-slate-500 mt-1">
                Student: {student.firstName} {student.lastName}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Academic Year
            </Text>
            <TextInput
              value={academicYear}
              onChangeText={setAcademicYear}
              placeholder="e.g. 2023-2024"
              className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-base text-slate-800"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Term
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setTerm("first")}
                className={`flex-1 py-3 rounded-lg border items-center ${
                  term === "first"
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-slate-200"
                }`}
              >
                <Text
                  className={`font-semibold ${term === "first" ? "text-white" : "text-slate-600"}`}
                >
                  First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTerm("second")}
                className={`flex-1 py-3 rounded-lg border items-center ${
                  term === "second"
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-slate-200"
                }`}
              >
                <Text
                  className={`font-semibold ${term === "second" ? "text-white" : "text-slate-600"}`}
                >
                  Second
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Final Grade
            </Text>
            <TextInput
              value={gradeValue}
              onChangeText={setGradeValue}
              keyboardType="numeric"
              placeholder="0 - 100"
              className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-base text-slate-800"
            />
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={
              createGradeMutation.isPending || updateGradeMutation.isPending
            }
            className="bg-indigo-600 py-4 rounded-xl items-center shadow-sm"
          >
            {createGradeMutation.isPending || updateGradeMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {isEditingSameRecord ? "Update Grade" : "Save Grade"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheetTemplate>
  );
});

FinalGradeSheet.displayName = "FinalGradeSheet";
