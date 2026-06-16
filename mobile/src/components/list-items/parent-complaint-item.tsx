import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Complaint } from "@/types";
import { formatDateTime } from "@/utils";

interface ParentComplaintItemProps {
  item: Complaint;
  currentUserId: string | null;
  markingComplaintId: string | null;
  onMarkAsRead: (id: string) => void;
}

export function ParentComplaintItem({
  item: complaint,
  currentUserId,
  markingComplaintId,
  onMarkAsRead,
}: ParentComplaintItemProps) {
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
            onPress={() => onMarkAsRead(complaint._id)}
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
}
