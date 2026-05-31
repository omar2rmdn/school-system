import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isFirst?: boolean;
  isLast?: boolean;
}

export const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <View style={styles.row}>
    <View style={styles.rowIconContainer}>
      <Ionicons name={icon} size={18} color={colors.SKY} />
    </View>
    <View style={styles.rowContent}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },
  rowIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.SKY_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.TEXT_SUB,
    fontFamily: "Nunito-Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 16,
    color: colors.TEXT_MAIN,
    fontFamily: "Nunito-Bold",
    fontWeight: "600",
  },
});
