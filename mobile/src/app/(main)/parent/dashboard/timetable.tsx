import {
  View,
  Text,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { SafeView } from "@/components/common/safe-view";
import { useStudentStore } from "@/store/student";
import { useClassTimetable } from "@/queries/timetable";
import { useParentStudents } from "@/queries/student";
import { Ionicons } from "@expo/vector-icons";
import {
  formatTime,
  getSubjectLabel,
  groupTimetableByDay,
  exportTimetableToPDF,
} from "@/utils";
import { TimetableItem } from "@/components/list-items";

export default function Timetable() {
  const { selectedStudentId } = useStudentStore();
  const { data: students } = useParentStudents();
  const selectedStudent = students?.find((s) => s._id === selectedStudentId);

  const classId =
    typeof selectedStudent?.class === "object"
      ? selectedStudent.class?._id
      : (selectedStudent?.class ?? null);

  const { data: timetables, isLoading } = useClassTimetable(classId);

  const groupedEntries = groupTimetableByDay(timetables);

  const resolveClassName = () => {
    if (
      timetables &&
      timetables.length > 0 &&
      typeof timetables[0].class === "object"
    ) {
      return timetables[0].class.title || "Class";
    }
    if (
      selectedStudent?.class &&
      typeof selectedStudent.class === "object"
    ) {
      return (
        selectedStudent.class.title || selectedStudent.class.name || "Class"
      );
    }
    return "Class";
  };

  return (
    <SafeView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-800">Timetable</Text>
        {groupedEntries.length > 0 && selectedStudentId && (
          <TouchableOpacity
            onPress={() =>
              exportTimetableToPDF(groupedEntries, resolveClassName())
            }
            className="bg-indigo-100 px-3 py-2 rounded-lg flex-row items-center border border-indigo-200"
          >
            <Ionicons name="download-outline" size={18} color="#4f46e5" />
            <Text className="text-indigo-700 font-semibold ml-2 text-sm">
              PDF
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!selectedStudentId ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="people-outline" size={64} color="#cbd5e1" />
          <Text className="text-lg text-slate-500 mt-4 text-center">
            Please select a student from the home screen first.
          </Text>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : groupedEntries.length > 0 ? (
        <SectionList
          sections={groupedEntries}
          keyExtractor={(item, index) => item._id || String(index)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View className="py-2 mt-2 bg-slate-50">
              <Text className="text-lg font-bold text-slate-800">{title}</Text>
            </View>
          )}
          renderItem={({ item }) => <TimetableItem item={item} />}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
          <Text className="text-lg text-slate-500 mt-4 text-center">
            No classes scheduled.
          </Text>
        </View>
      )}
    </SafeView>
  );
}
