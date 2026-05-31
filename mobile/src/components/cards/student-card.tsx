import { Href, router } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";

interface ClassInfo {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  class: ClassInfo;
  createdAt: string;
  updatedAt: string;
}

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
}

export const StudentCard = ({ student, onPress }: StudentCardProps) => {
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <Pressable
      onPress={
        onPress || (() => router.push("/(main)/parent/dashboard" as Href))
      }
      style={styles.card}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.firstName?.charAt(0)}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{fullName}</Text>
        {student.class && (
          <Text style={styles.class}>Class: {student.class.name}</Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3a90ed",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontFamily: "Nunito-ExtraBold",
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "Nunito-Bold",
    fontWeight: "700",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Nunito-Medium",
    marginBottom: 2,
  },
  class: {
    fontSize: 13,
    color: "#3a90ed",
    fontFamily: "Nunito-Bold",
    fontWeight: "700",
  },
});
