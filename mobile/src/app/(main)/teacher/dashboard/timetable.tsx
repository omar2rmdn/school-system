import {
  View,
  Text,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { SafeView } from "@/components/common/safe-view";
import { useClassTimetable } from "@/queries/timetable";
import { Ionicons } from "@expo/vector-icons";
import { useTeacherFilters } from "@/hooks/use-teacher-filters";
import { FilterChips } from "@/components/common/filter-chips";
import {
  formatTime,
  getSubjectLabel,
  groupTimetableByDay,
  exportTimetableToPDF,
} from "@/utils";
import { TimetableItem } from "@/components/list-items";

export default function Timetable() {
  const { classes, activeClassId, setSelectedClassId } = useTeacherFilters();

  const { data: timetables, isLoading } = useClassTimetable(activeClassId);

  const groupedEntries = groupTimetableByDay(timetables);

  const resolveClassName = () => {
    if (
      timetables &&
      timetables.length > 0 &&
      typeof timetables[0].class === "object"
    ) {
      return timetables[0].class.title || "Class";
    }
    const selectedClass = classes.find((c) => c._id === activeClassId);
    return selectedClass?.title || "Class";
  };

  return (
    <SafeView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-800">Timetable</Text>
        {groupedEntries.length > 0 && activeClassId && (
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

      {/* Class Filter */}
      <View className="px-6 mb-2 py-2">
        <FilterChips
          items={classes}
          activeId={activeClassId}
          onSelect={setSelectedClassId}
        />
      </View>

      {classes.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="book-outline" size={64} color="#cbd5e1" />
          <Text className="text-lg text-slate-500 mt-4 text-center">
            You don&apos;t have any classes assigned.
          </Text>
        </View>
      ) : !activeClassId ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="list-outline" size={64} color="#cbd5e1" />
          <Text className="text-lg text-slate-500 mt-4 text-center">
            Please select a class to view its timetable.
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
