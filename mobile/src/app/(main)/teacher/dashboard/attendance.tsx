import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { SafeView } from "@/components/common/safe-view";
import { FilterChips } from "@/components/common/filter-chips";
import { AttendanceEmptyState } from "@/components/teacher-attendance/empty-state";
import { StudentAttendanceCard } from "@/components/teacher-attendance/student-card";
import { useTeacherFilters } from "@/hooks/use-teacher-filters";
import { useAttendanceDrafts } from "@/hooks/use-attendance-drafts";
import { formatDate } from "@/utils";

export default function AttendanceScreen() {
  const filters = useTeacherFilters();
  const attendance = useAttendanceDrafts(
    filters.activeClassId,
    filters.activeSubjectId,
    filters.selectedDate,
  );

  const canShowSaveBar =
    filters.classes.length > 0 &&
    filters.subjects.length > 0 &&
    !!filters.activeClassId &&
    !!filters.activeSubjectId;

  return (
    <SafeView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-bold text-slate-800">
              Attendance
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              Mark attendance for {filters.selectedClassTitle} -{" "}
              {filters.selectedSubjectTitle}
            </Text>
            <TouchableOpacity
              onPress={() => filters.setShowDatePicker(true)}
              className="mt-3 self-start flex-row items-center rounded-full border border-slate-200 bg-white px-3 py-2"
            >
              <Ionicons name="calendar-outline" size={16} color="#2563eb" />
              <Text className="ml-2 text-sm font-medium text-slate-700">
                {formatDate(filters.selectedDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {attendance.isFetchingAttendance &&
            !attendance.isLoadingAttendance && (
              <ActivityIndicator size="small" color="#2563eb" />
            )}
        </View>
      </View>

      <View className="px-6 pb-3">
        <FilterChips
          items={filters.classes}
          activeId={filters.activeClassId}
          onSelect={filters.setSelectedClassId}
          label="Select Class"
          activeColor="blue"
        />
      </View>

      <View className="px-6 pb-3">
        <FilterChips
          items={filters.subjects}
          activeId={filters.activeSubjectId}
          onSelect={filters.setSelectedSubjectId}
          label="Select Subject"
          activeColor="emerald"
        />
      </View>

      {filters.showDatePicker && (
        <DateTimePicker
          value={filters.selectedDate}
          mode="date"
          display="default"
          onChange={filters.handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <View className="flex-1 px-6">
        {filters.classes.length === 0 ? (
          <AttendanceEmptyState
            icon="school-outline"
            message="You don't have any classes assigned."
          />
        ) : filters.subjects.length === 0 ? (
          <AttendanceEmptyState
            icon="book-outline"
            message="You don't have any subjects assigned."
          />
        ) : !filters.activeClassId ? (
          <AttendanceEmptyState
            icon="list-outline"
            message="Please select a class first."
          />
        ) : !filters.activeSubjectId ? (
          <AttendanceEmptyState
            icon="book-outline"
            message="Please select a subject first."
          />
        ) : attendance.isLoadingStudents || attendance.isLoadingAttendance ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : attendance.students.length === 0 ? (
          <AttendanceEmptyState
            icon="people-outline"
            message="No students found in this class."
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {attendance.students.map((student) => (
              <StudentAttendanceCard
                key={student._id}
                student={student}
                draft={attendance.getDraft(student._id)}
                hasPendingChanges={attendance.pendingStudentIds.has(
                  student._id,
                )}
                onSelectStatus={(studentId, status) =>
                  attendance.updateStudentDraft(studentId, { status })
                }
              />
            ))}
          </ScrollView>
        )}
      </View>

      {canShowSaveBar && (
        <View className="border-t border-slate-200 bg-white px-6 py-4">
          <TouchableOpacity
            onPress={attendance.handleSave}
            disabled={
              attendance.pendingChanges.length === 0 || attendance.isSaving
            }
            className={`items-center rounded-2xl py-4 ${
              attendance.pendingChanges.length === 0 || attendance.isSaving
                ? "bg-slate-300"
                : "bg-blue-600"
            }`}
          >
            {attendance.isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">
                {attendance.pendingChanges.length > 0
                  ? `Save ${attendance.pendingChanges.length} Change${
                      attendance.pendingChanges.length === 1 ? "" : "s"
                    }`
                  : "No Changes to Save"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeView>
  );
}
