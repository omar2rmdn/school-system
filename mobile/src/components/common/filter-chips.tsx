import { View, Text, ScrollView, TouchableOpacity } from "react-native";

type FilterChipsProps = {
  items: { _id: string; title?: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
  label?: string;
  activeColor?: "indigo" | "emerald" | "blue";
};

const colorMap = {
  indigo: {
    active: "border-indigo-600 bg-indigo-600",
    text: "text-white",
    inactive: "border-slate-200 bg-white",
    inactiveText: "text-slate-600",
  },
  emerald: {
    active: "border-emerald-600 bg-emerald-600",
    text: "text-white",
    inactive: "border-slate-200 bg-white",
    inactiveText: "text-slate-600",
  },
  blue: {
    active: "border-blue-600 bg-blue-600",
    text: "text-white",
    inactive: "border-slate-200 bg-white",
    inactiveText: "text-slate-700",
  },
};

export function FilterChips({
  items,
  activeId,
  onSelect,
  label,
  activeColor = "indigo",
}: FilterChipsProps) {
  if (items.length === 0) return null;

  const colors = colorMap[activeColor];

  return (
    <View>
      {label && (
        <Text className="mb-2 text-sm font-semibold text-slate-500">
          {label}
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item) => {
          const isActive = activeId === item._id;
          return (
            <TouchableOpacity
              key={item._id}
              onPress={() => onSelect(item._id)}
              className={`mr-3 rounded-full border px-4 py-2 ${
                isActive ? colors.active : colors.inactive
              }`}
            >
              <Text
                className={`font-semibold ${
                  isActive ? colors.text : colors.inactiveText
                }`}
              >
                {item.title || "Unknown"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
