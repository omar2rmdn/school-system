import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Complaint } from "@/types";
import { formatDateTime } from "@/utils";

interface SupervisorComplaintItemProps {
  item: Complaint;
  currentUserId: string | null;
  onPress: (complaint: Complaint) => void;
}

export function SupervisorComplaintItem({
  item: complaint,
  currentUserId,
  onPress,
}: SupervisorComplaintItemProps) {
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
      onPress={() => onPress(complaint)}
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
}
