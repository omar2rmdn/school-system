import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { isAxiosError } from "axios";
import { Ionicons } from "@expo/vector-icons";
import { SafeView } from "@/components/common/safe-view";
import { useParentStudents } from "@/queries/student";
import {
  useCreateComplaint,
  useMarkComplaintAsRead,
  useStudentComplaints,
} from "@/queries/complaints";
import { useStudentStore } from "@/store/student";
import { useAuthStore } from "@/store";
import { BottomSheetMethods } from "@/components/templates/bottom-sheet/types";
import { BottomSheet } from "@/components/templates/bottom-sheet";
import { formatDateTime } from "@/utils";
import { DashboardList } from "@/components/cards/dashboard-list";
import { Complaint } from "@/types";

export default function Complaints() {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const session = useAuthStore((state) => state.session);
  const currentUserId = session?.user._id ?? null;

  const { selectedStudentId } = useStudentStore();
  const { data: students } = useParentStudents();
  const selectedStudent = students?.find(
    (student) => student._id === selectedStudentId,
  );

  const { data: complaints, isLoading } =
    useStudentComplaints(selectedStudentId);
  const createComplaint = useCreateComplaint();
  const markAsRead = useMarkComplaintAsRead();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [readError, setReadError] = useState("");
  const [markingComplaintId, setMarkingComplaintId] = useState<string | null>(
    null,
  );

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      setFormError("Please select a student from the home screen first.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    try {
      setFormError("");
      await createComplaint.mutateAsync({
        studentId: selectedStudentId,
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      sheetRef.current?.close();
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : null;
      setFormError(message || "Unable to submit complaint. Please try again.");
    }
  };

  const handleMarkAsRead = async (complaintId: string) => {
    try {
      setReadError("");
      setMarkingComplaintId(complaintId);
      await markAsRead.mutateAsync(complaintId);
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : null;
      setReadError(message || "Unable to mark complaint as read.");
    } finally {
      setMarkingComplaintId(null);
    }
  };

  const studentLabel = selectedStudent
    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`.trim()
    : "selected student";

  const renderComplaintItem = ({ item: complaint }: { item: Complaint }) => {
    const senderId =
      typeof complaint.sender === "string"
        ? complaint.sender
        : complaint.sender._id;
    const sentByCurrentUser = senderId === currentUserId;
    const isUnreadIncoming = !sentByCurrentUser && !complaint.isRead;

    let senderName = "Unknown sender";
    if (typeof complaint.sender !== "string") {
      senderName =
        `${complaint.sender.firstName ?? ""} ${complaint.sender.lastName ?? ""}`.trim() ||
        "Unknown sender";
    }

    let badgeLabel = "Received";
    let badgeClassName = "border-sky-100 bg-sky-50";
    let badgeTextClassName = "text-sky-700";

    if (complaint.isRead) {
      badgeLabel = "Read";
      badgeClassName = "border-emerald-100 bg-emerald-50";
      badgeTextClassName = "text-emerald-700";
    } else if (sentByCurrentUser) {
      badgeLabel = "Sent";
      badgeClassName = "border-amber-100 bg-amber-50";
      badgeTextClassName = "text-amber-700";
    }

    return (
      <View className="mb-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <View className="mb-2 flex-row items-start justify-between">
          <Text className="flex-1 pr-3 text-base font-bold text-slate-800">
            {complaint.title}
          </Text>
          <View className={`rounded-full border px-2.5 py-1 ${badgeClassName}`}>
            <Text className={`text-xs font-semibold ${badgeTextClassName}`}>
              {badgeLabel}
            </Text>
          </View>
        </View>

        <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {sentByCurrentUser ? "To Supervisor" : `From ${senderName}`}
        </Text>

        <Text className="mb-3 text-sm leading-6 text-slate-600">
          {complaint.description}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center pr-3">
            <Ionicons name="time-outline" size={14} color="#94a3b8" />
            <Text className="ml-1.5 text-xs text-slate-400">
              {formatDateTime(complaint.createdAt)}
            </Text>
          </View>

          {isUnreadIncoming ? (
            <Pressable
              onPress={() => handleMarkAsRead(complaint._id)}
              disabled={markingComplaintId === complaint._id}
              className={`rounded-lg px-3 py-2 ${
                markingComplaintId === complaint._id
                  ? "bg-sky-300"
                  : "bg-sky-600"
              }`}
            >
              {markingComplaintId === complaint._id ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-xs font-bold text-white">
                  Mark as Read
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <>
      <SafeView className="flex-1 bg-slate-50">
        {!selectedStudentId ? (
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
            <Text className="mt-4 text-center text-lg text-slate-500">
              Please select a student from the home screen first.
            </Text>
          </View>
        ) : (
          <View className="flex-1">
            <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-bold uppercase tracking-wider text-slate-600">
                  Complaint History
                </Text>
                <Text className="text-sm text-slate-400">
                  {complaints?.length ?? 0} total
                </Text>
              </View>
              <Pressable
                onPress={() => sheetRef.current?.snapToIndex(0)}
                className="rounded-lg bg-emerald-100 px-3 py-2"
              >
                <View className="flex-row items-center">
                  <Ionicons name="add" size={18} color="#059669" />
                  <Text className="ml-1 text-sm font-bold text-emerald-700">
                    New
                  </Text>
                </View>
              </Pressable>
            </View>

            {!!readError && (
              <Text className="mb-3 text-center text-sm font-medium text-red-500">
                {readError}
              </Text>
            )}

            <DashboardList
              variant="list"
              data={complaints ?? []}
              keyExtractor={(item) => item._id}
              renderItem={renderComplaintItem}
              isLoading={isLoading}
              emptyIcon="chatbox-ellipses-outline"
              emptyMessage="No complaints found for this student."
            />
          </View>
        )}
      </SafeView>

      <BottomSheet
        ref={sheetRef}
        snapPoints={["70%", "90%"]}
        backgroundColor="#ffffff"
        backdropOpacity={0.6}
        borderRadius={28}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            <View className="mb-6 flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#059669"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-800">
                  New Complaint
                </Text>
                <Text className="text-sm text-slate-500">
                  Submit a complaint for {studentLabel}.
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-slate-700">
                Title
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter complaint title"
                placeholderTextColor="#94a3b8"
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-base text-slate-900"
              />
            </View>

            <View className="mb-6">
              <Text className="mb-1.5 text-sm font-medium text-slate-700">
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the issue clearly"
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                className="min-h-32 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-base text-slate-900"
              />
            </View>

            {!!formError && (
              <Text className="mb-4 text-center text-sm font-medium text-red-500">
                {formError}
              </Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={createComplaint.isPending}
              className={`items-center rounded-xl py-4 shadow-sm ${
                createComplaint.isPending ? "bg-emerald-400" : "bg-emerald-600"
              }`}
            >
              {createComplaint.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Submit Complaint
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>
    </>
  );
}
