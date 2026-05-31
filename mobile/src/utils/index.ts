import { Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { TimetableEntry } from "@/types";
import { WEEKDAYS } from "@/consts";

const getStatusColor = (status: string) => {
  switch (status) {
    case "present":
      return "text-emerald-600 bg-emerald-100";
    case "absent":
      return "text-red-600 bg-red-100";
    case "late":
      return "text-orange-600 bg-orange-100";
    case "excused":
      return "text-sky-700 bg-sky-100";
    default:
      return "text-slate-600 bg-slate-100";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "present":
      return "checkmark-circle";
    case "absent":
      return "close-circle";
    case "late":
      return "time";
    case "excused":
      return "document-text";
    default:
      return "help-circle";
  }
};

const formatDate = (date?: Date) => {
  if (!date) return "Select date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${minutes} ${ampm}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getSubjectLabel = (subject: TimetableEntry["subject"]) => {
  if (typeof subject === "string") return subject;
  return subject?.title || subject?.name || "Unknown Subject";
};

const getGradeColor = (score: number) => {
  if (score >= 90) return "text-emerald-600 bg-emerald-100";
  if (score >= 75) return "text-blue-600 bg-blue-100";
  if (score >= 50) return "text-orange-600 bg-orange-100";
  return "text-red-600 bg-red-100";
};

export const extractEntityId = (value: unknown) => {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "_id" in value &&
    typeof value._id === "string"
  ) {
    return value._id;
  }

  return null;
};

export const getAttendanceStudentId = (attendance: any) =>
  extractEntityId(attendance.student);

export const filterTeacherItems = <T extends { _id: string }>(
  allItems: T[] | undefined,
  teacherItems: unknown[] | undefined,
) => {
  if (!allItems || !teacherItems || teacherItems.length === 0) {
    return [];
  }

  const ids = new Set(
    teacherItems
      .map((item) => extractEntityId(item))
      .filter((item): item is string => Boolean(item)),
  );

  return allItems.filter((item) => ids.has(item._id));
};

export const groupTimetableByDay = (
  timetables: { days: TimetableEntry[] }[] | undefined,
) => {
  if (!timetables || timetables.length === 0) return [];

  const allEntries: TimetableEntry[] = timetables.flatMap(
    (t) => t.days || [],
  );

  const grouped: { title: string; data: TimetableEntry[] }[] = [];

  WEEKDAYS.forEach((day) => {
    const dayEntries = allEntries
      .filter((entry) => entry.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (dayEntries.length > 0) {
      grouped.push({
        title: day,
        data: dayEntries,
      });
    }
  });

  return grouped;
};

export const exportTimetableToPDF = async (
  groupedEntries: { title: string; data: TimetableEntry[] }[],
  className: string,
) => {
  if (!groupedEntries || groupedEntries.length === 0) {
    Alert.alert("No Data", "There is no timetable data to export.");
    return;
  }

  try {
    let htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background-color: #f8fafc; }
            .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            h1 { text-align: center; color: #0f172a; font-size: 28px; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 3px solid #3b82f6; padding-bottom: 15px; display: block; width: 100%; }
            .day-section { margin-bottom: 30px; page-break-inside: avoid; }
            .day-header { background-color: #3b82f6; color: white; padding: 12px 20px; font-size: 20px; font-weight: bold; border-radius: 8px 8px 0 0; margin: 0; }
            table { width: 100%; border-collapse: collapse; background-color: white; border-radius: 0 0 8px 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
            th, td { padding: 14px 20px; text-align: left; }
            th { background-color: #eff6ff; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            tr:not(:last-child) { border-bottom: 1px solid #e2e8f0; }
            .subject { font-weight: bold; color: #1e293b; font-size: 16px; }
            .time { color: #2563eb; font-weight: 600; background-color: #dbeafe; padding: 6px 12px; border-radius: 20px; display: inline-block; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Timetable - ${className}</h1>
    `;

    groupedEntries.forEach((group) => {
      htmlContent += `
        <div class="day-section">
          <h2 class="day-header">${group.title}</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 60%;">Subject</th>
                <th style="width: 40%; text-align: right;">Time</th>
              </tr>
            </thead>
            <tbody>
      `;
      group.data.forEach((item) => {
        const subjectName = getSubjectLabel(item.subject);
        const timeString = `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`;
        htmlContent += `
              <tr>
                <td><span class="subject">${subjectName}</span></td>
                <td style="text-align: right;"><span class="time">${timeString}</span></td>
              </tr>
        `;
      });
      htmlContent += `
            </tbody>
          </table>
        </div>
      `;
    });

    htmlContent += `
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } else {
      Alert.alert("Error", "Sharing is not available on this device");
    }
  } catch (error) {
    console.error("PDF Export Error:", error);
    Alert.alert("Error", "Failed to export timetable to PDF");
  }
};

export {
  getStatusColor,
  getStatusIcon,
  formatDate,
  formatTime,
  formatDateTime,
  getSubjectLabel,
  getGradeColor,
};

