import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AttendanceDraft, AttendanceStatus, Student } from "@/types";
import { getStatusColor, getStatusIcon } from "@/utils";
import { STATUS_ICON_COLORS, STATUS_OPTIONS } from "@/consts";

export function StudentAttendanceCard({
  student,
  draft,
  hasPendingChanges,
  onSelectStatus,
}: {
  student: Student;
  draft: AttendanceDraft;
  hasPendingChanges: boolean;
  onSelectStatus: (studentId: string, status: AttendanceStatus) => void;
}) {
  const selectedStatus = draft.status;
  const statusClasses = getStatusColor(selectedStatus ?? "unknown").split(" ");
  const accentClassName =
    STATUS_OPTIONS.find((option) => option.value === selectedStatus)
      ?.accentClassName ?? "border-slate-200 bg-white";
  const hasRecordedStatus = Boolean(selectedStatus);
  const badgeLabel = hasPendingChanges
    ? "Unsaved"
    : hasRecordedStatus
      ? "Saved"
      : "Not set";

  return (
    <View
      className={`mb-4 rounded-2xl border p-4 shadow-sm ${accentClassName}`}
    >
      <View className="flex-row items-start">
        <View
          className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${statusClasses[1]}`}
        >
          <Ionicons
            name={getStatusIcon(selectedStatus ?? "unknown") as any}
            size={22}
            color={STATUS_ICON_COLORS[selectedStatus ?? "unknown"]}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="pr-3 text-base font-bold text-slate-800">
              {student.firstName} {student.lastName}
            </Text>
            <View
              className={`rounded-full px-2.5 py-1 ${
                hasPendingChanges
                  ? "bg-amber-100"
                  : hasRecordedStatus
                    ? "bg-emerald-100"
                    : "bg-slate-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  hasPendingChanges
                    ? "text-amber-700"
                    : hasRecordedStatus
                      ? "text-emerald-700"
                      : "text-slate-500"
                }`}
              >
                {badgeLabel}
              </Text>
            </View>
          </View>

          <Text className="mt-1 text-sm text-slate-500">
            {selectedStatus
              ? `Current status: ${selectedStatus}`
              : "No attendance recorded for this date yet."}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = selectedStatus === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelectStatus(student._id, option.value)}
              className={`mr-2 mb-2 rounded-full border px-3 py-2 ${
                isSelected
                  ? "border-slate-900 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <Text
                className={`font-semibold ${
                  isSelected ? "text-white" : "text-slate-700"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
