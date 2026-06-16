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
import { ComplaintDetailsSheet } from "@/components/sheets/complaint-details-sheet";
import { BottomSheet } from "@/components/templates/bottom-sheet";
import { BottomSheetMethods } from "@/components/templates/bottom-sheet/types";
import {
  useComplaints,
  useCreateComplaint,
  useMarkComplaintAsRead,
} from "@/queries/complaints";
import { useStudents } from "@/queries/student";
import { useAuthStore } from "@/store";
import { Complaint } from "@/types";
import { formatDateTime } from "@/utils";
import { DashboardList } from "@/components/cards/dashboard-list";

export default function Complaints() {
  const createSheetRef = useRef<BottomSheetMethods>(null);
  const detailsSheetRef = useRef<BottomSheetMethods>(null);
  const session = useAuthStore((state) => state.session);
  const currentUserId = session?.user._id ?? null;

  const [draftStudentId, setDraftStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [readError, setReadError] = useState("");
  const [markingComplaintId, setMarkingComplaintId] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const {
    data: students,
    isLoading: isStudentsLoading,
    refetch: refetchStudents,
  } = useStudents();
  const {
    data: complaints,
    isLoading,
    refetch,
  } = useComplaints();
  const createComplaint = useCreateComplaint();
  const markAsRead = useMarkComplaintAsRead();

  const openSheet = () => {
    setFormError("");
    setDraftStudentId(students?.[0]?._id || "");
    createSheetRef.current?.snapToIndex(0);
  };

  const openComplaintDetails = (complaint: Complaint) => {
    setReadError("");
    setSelectedComplaint(complaint);
    detailsSheetRef.current?.snapToIndex(0);
  };

  const handleSubmit = async () => {
    if (!draftStudentId) {
      setFormError("Please select a student.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    try {
      setFormError("");
      await createComplaint.mutateAsync({
        studentId: draftStudentId,
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      createSheetRef.current?.close();
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
      setSelectedComplaint((current) =>
        current && current._id === complaintId ? { ...current, isRead: true } : current
      );
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : null;
      setReadError(message || "Unable to mark complaint as read.");
    } finally {
      setMarkingComplaintId(null);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchStudents()]);
  };

  const renderComplaintItem = ({ item: complaint }: { item: Complaint }) => {
    const senderId =
      typeof complaint.sender === "string"
        ? complaint.sender
        : complaint.sender._id;
    const sentByCurrentUser = senderId === currentUserId;

    let senderName = "Unknown sender";
    let senderRole = "Unknown";
    if (typeof complaint.sender !== "string") {
      senderName =
        `${complaint.sender.firstName ?? ""} ${complaint.sender.lastName ?? ""}`.trim() ||
        "Unknown sender";
      if (complaint.sender.role === "parent") {
        senderRole = "Parent";
      } else if (complaint.sender.role === "supervisor") {
        senderRole = "Supervisor";
      } else if (complaint.sender.role) {
        senderRole = complaint.sender.role;
      }
    }

    let studentName = "Unknown student";
    if (typeof complaint.student !== "string") {
      studentName =
        `${complaint.student.firstName ?? ""} ${complaint.student.lastName ?? ""}`.trim() ||
        "Unknown student";
    }

    let badgeLabel = "Unread";
    let badgeClassName = "border-amber-100 bg-amber-50";
    let badgeTextClassName = "text-amber-700";

    if (complaint.isRead) {
      badgeLabel = "Read";
      badgeClassName = "border-emerald-100 bg-emerald-50";
      badgeTextClassName = "text-emerald-700";
    } else if (sentByCurrentUser) {
      badgeLabel = "Sent";
      badgeClassName = "border-slate-200 bg-slate-100";
      badgeTextClassName = "text-slate-600";
    }

    return (
      <Pressable
        onPress={() => openComplaintDetails(complaint)}
        className="mb-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
      >
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

        <Text className="mb-1 text-sm font-medium text-slate-700">
          {studentName}
        </Text>

        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {sentByCurrentUser ? "Sent by you" : `${senderRole} • ${senderName}`}
        </Text>

        <Text
          numberOfLines={2}
          className="mb-3 text-sm leading-6 text-slate-600"
        >
          {complaint.description}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center pr-3">
            <Ionicons name="time-outline" size={14} color="#94a3b8" />
            <Text className="ml-1.5 text-xs text-slate-400">
              {formatDateTime(complaint.createdAt)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className="mr-1.5 text-xs font-semibold text-amber-700">
              View details
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color="#b45309"
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <SafeView className="flex-1 bg-slate-50">
        {isLoading || isStudentsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#d97706" />
          </View>
        ) : (
          <View className="flex-1">
            <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-bold uppercase tracking-wider text-slate-600">
                  Complaints
                </Text>
                <Text className="text-sm text-slate-400">
                  {complaints?.length ?? 0} total
                </Text>
              </View>
              <Pressable
                onPress={openSheet}
                disabled={!students || students.length === 0}
                className={`rounded-lg px-3 py-2 ${
                  students && students.length > 0 ? "bg-amber-100" : "bg-slate-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="add"
                    size={18}
                    color={students && students.length > 0 ? "#b45309" : "#64748b"}
                  />
                  <Text
                    className={`ml-1 text-sm font-bold ${
                      students && students.length > 0
                        ? "text-amber-700"
                        : "text-slate-500"
                    }`}
                  >
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
              isLoading={false}
              emptyIcon="chatbox-ellipses-outline"
              emptyMessage="No complaints found yet."
            />
          </View>
        )}
      </SafeView>

      <BottomSheet
        ref={createSheetRef}
        snapPoints={["75%", "92%"]}
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
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full border border-amber-100 bg-amber-50">
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#b45309"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-800">
                  New Complaint
                </Text>
                <Text className="text-sm text-slate-500">
                  Send a complaint to a student's parent.
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Student
              </Text>

              {students && students.length > 0 ? (
                <View className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                  {students.map((student, index) => (
                    <Pressable
                      key={student._id}
                      onPress={() => setDraftStudentId(student._id)}
                      className={`rounded-lg border px-4 py-3 ${
                        draftStudentId === student._id
                          ? "border-amber-500 bg-amber-50"
                          : "border-slate-200 bg-white"
                      } ${index < students.length - 1 ? "mb-2" : ""}`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          draftStudentId === student._id
                            ? "text-amber-700"
                            : "text-slate-700"
                        }`}
                      >
                        {student.firstName} {student.lastName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Text className="text-sm text-slate-500">
                    No students available.
                  </Text>
                </View>
              )}
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
              disabled={createComplaint.isPending || !students || students.length === 0}
              className={`items-center rounded-xl py-4 shadow-sm ${
                createComplaint.isPending || !students || students.length === 0
                  ? "bg-amber-300"
                  : "bg-amber-600"
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

      <ComplaintDetailsSheet
        ref={detailsSheetRef}
        complaint={selectedComplaint}
        currentUserId={currentUserId}
        readError={readError}
        markingComplaintId={markingComplaintId}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
}
