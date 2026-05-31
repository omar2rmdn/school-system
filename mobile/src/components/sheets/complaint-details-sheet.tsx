import { forwardRef } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "@/components/templates/bottom-sheet";
import { BottomSheetMethods } from "@/components/templates/bottom-sheet/types";
import { Complaint } from "@/types";
import { formatDateTime } from "@/utils";

interface ComplaintDetailsSheetProps {
  complaint: Complaint | null;
  currentUserId: string | null;
  readError?: string;
  markingComplaintId: string | null;
  onMarkAsRead: (complaintId: string) => void | Promise<void>;
}

export const ComplaintDetailsSheet = forwardRef<
  BottomSheetMethods,
  ComplaintDetailsSheetProps
>(({ complaint, currentUserId, readError, markingComplaintId, onMarkAsRead }, ref) => {
  const senderId = complaint
    ? typeof complaint.sender === "string"
      ? complaint.sender
      : complaint.sender._id
    : null;
  const sentByCurrentUser = !!senderId && senderId === currentUserId;
  const isUnreadIncoming = !!complaint && !sentByCurrentUser && !complaint.isRead;

  let senderName = "Unknown sender";
  let senderRole = "Unknown";
  if (complaint && typeof complaint.sender !== "string") {
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
  if (complaint && typeof complaint.student !== "string") {
    studentName =
      `${complaint.student.firstName ?? ""} ${complaint.student.lastName ?? ""}`.trim() ||
      "Unknown student";
  }

  let badgeLabel = "Unread";
  let badgeClassName = "border-amber-100 bg-amber-50";
  let badgeTextClassName = "text-amber-700";

  if (complaint?.isRead) {
    badgeLabel = "Read";
    badgeClassName = "border-emerald-100 bg-emerald-50";
    badgeTextClassName = "text-emerald-700";
  } else if (sentByCurrentUser) {
    badgeLabel = "Sent";
    badgeClassName = "border-slate-200 bg-slate-100";
    badgeTextClassName = "text-slate-600";
  }

  return (
    <BottomSheet
      ref={ref}
      snapPoints={["70%", "90%"]}
      backgroundColor="#ffffff"
      backdropOpacity={0.6}
      borderRadius={28}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {complaint ? (
          <>
            <View className="mb-6 flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full border border-amber-100 bg-amber-50">
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={24}
                  color="#b45309"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-800">
                  Complaint Details
                </Text>
                <Text className="text-sm text-slate-500">
                  Review the full complaint information.
                </Text>
              </View>
            </View>

            {!!readError && (
              <Text className="mb-4 text-center text-sm font-medium text-red-500">
                {readError}
              </Text>
            )}

            <View className="mb-4 flex-row items-start justify-between">
              <Text className="flex-1 pr-3 text-xl font-bold text-slate-800">
                {complaint.title}
              </Text>
              <View className={`rounded-full border px-2.5 py-1 ${badgeClassName}`}>
                <Text className={`text-xs font-semibold ${badgeTextClassName}`}>
                  {badgeLabel}
                </Text>
              </View>
            </View>

            <View className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Student
              </Text>
              <Text className="mt-1 text-sm font-medium text-slate-700">
                {studentName}
              </Text>
            </View>

            <View className="mb-4 flex-row items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <View className="flex-1 pr-3">
                <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Sender
                </Text>
                <Text className="mt-1 text-sm font-medium text-slate-700">
                  {senderName}
                </Text>
              </View>
              <View className="rounded-full bg-sky-50 px-3 py-1">
                <Text className="text-xs font-semibold text-sky-700">
                  {senderRole}
                </Text>
              </View>
            </View>

            <View className="mb-6 rounded-xl bg-slate-50 px-4 py-3">
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-700">
                {complaint.description}
              </Text>
            </View>

            <View className="mb-6 flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#94a3b8" />
              <Text className="ml-2 text-sm text-slate-500">
                {formatDateTime(complaint.createdAt)}
              </Text>
            </View>

            {isUnreadIncoming ? (
              <Pressable
                onPress={() => onMarkAsRead(complaint._id)}
                disabled={markingComplaintId === complaint._id}
                className={`items-center rounded-xl py-4 shadow-sm ${
                  markingComplaintId === complaint._id ? "bg-amber-300" : "bg-amber-600"
                }`}
              >
                {markingComplaintId === complaint._id ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-base font-bold text-white">
                    Mark as Read
                  </Text>
                )}
              </Pressable>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
});

ComplaintDetailsSheet.displayName = "ComplaintDetailsSheet";
