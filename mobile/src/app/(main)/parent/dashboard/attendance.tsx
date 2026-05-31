import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeView } from "@/components/common/safe-view";
import { useStudentStore } from "@/store/student";
import { useStudentAttendance } from "@/queries/attendance";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { formatDate, getStatusColor, getStatusIcon } from "@/utils";

export default function Attendance() {
  const { selectedStudentId } = useStudentStore();

  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const { data: attendances, isLoading } = useStudentAttendance(
    selectedStudentId,
    fromDate,
    toDate,
  );

  const handleFromDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
      if (toDate && selectedDate > toDate) {
        setToDate(selectedDate);
      }
    }
  };

  const handleToDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
      if (fromDate && selectedDate < fromDate) {
        setFromDate(selectedDate);
      }
    }
  };

  const clearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <SafeView className="flex-1 bg-slate-50 pt-4">
      {selectedStudentId && (
        <View className="px-4 pb-4 border-b border-slate-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Filter by Date
            </Text>
            {(fromDate || toDate) && (
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-sm text-emerald-600 font-medium">
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row gap-x-3">
            <View className="flex-1">
              <Text className="text-xs text-slate-500 mb-1">From</Text>
              <TouchableOpacity
                onPress={() => setShowFromPicker(true)}
                className="flex-row items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm"
              >
                <Text
                  className={`text-sm ${fromDate ? "text-slate-800 font-medium" : "text-slate-400"}`}
                >
                  {formatDate(fromDate)}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={fromDate ? "#059669" : "#94a3b8"}
                />
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <Text className="text-xs text-slate-500 mb-1">To</Text>
              <TouchableOpacity
                onPress={() => setShowToPicker(true)}
                className="flex-row items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm"
              >
                <Text
                  className={`text-sm ${toDate ? "text-slate-800 font-medium" : "text-slate-400"}`}
                >
                  {formatDate(toDate)}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={toDate ? "#059669" : "#94a3b8"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display="default"
              onChange={handleFromDateChange}
              maximumDate={new Date()}
            />
          )}
          {showToPicker && (
            <DateTimePicker
              value={toDate || new Date()}
              mode="date"
              display="default"
              onChange={handleToDateChange}
              minimumDate={fromDate}
              maximumDate={new Date()}
            />
          )}
        </View>
      )}

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
      ) : attendances && attendances.length > 0 ? (
        <FlatList
          data={attendances}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
            paddingTop: 16,
          }}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100 flex-row items-center">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                  getStatusColor(item.status).split(" ")[1]
                }`}
              >
                <Ionicons
                  name={getStatusIcon(item.status)}
                  size={24}
                  className={getStatusColor(item.status).split(" ")[0]}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-800 capitalize mb-1">
                  {item.status}
                </Text>
                <Text className="text-sm text-slate-500">
                  {new Date(item.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
          <Text className="text-lg text-slate-500 mt-4 text-center">
            No attendance records found for this student.
          </Text>
        </View>
      )}
    </SafeView>
  );
}
