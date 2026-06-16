import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  type ListRenderItemInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface DashboardItem {
  id: number | string;
  title: string;
  icon: string;
  description: string;
  color: string;
  bg: string;
  path: string;
}

interface MenuProps {
  items: DashboardItem[];
  onPress: (path: string) => void;
}

interface ListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null;
  isLoading?: boolean;
  loadingColor?: string;
  emptyIcon?: string;
  emptyMessage?: string;
  error?: string | null;
  contentContainerStyle?: object;
}

export type DashboardListProps<T = unknown> =
  | ({ variant: "menu" } & MenuProps)
  | ({ variant: "list" } & ListProps<T>);

function MenuList({ items, onPress }: MenuProps) {
  return (
    <View className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onPress(item.path)}
          className={`flex-row items-center p-4 ${
            index !== items.length - 1 ? "border-b border-slate-100" : ""
          }`}
          activeOpacity={0.7}
        >
          <View
            className={`w-12 h-12 rounded-full ${item.bg} items-center justify-center mr-4`}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              className={item.color}
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-800 mb-0.5">
              {item.title}
            </Text>
            <Text className="text-sm text-slate-500">
              {item.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function DataList<T>({
  data,
  keyExtractor,
  renderItem,
  isLoading,
  loadingColor = "#059669",
  emptyIcon = "list-outline",
  emptyMessage = "No items found.",
  error,
  contentContainerStyle,
}: ListProps<T>) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={loadingColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 24,
        paddingTop: 16,
        ...contentContainerStyle,
      }}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name={emptyIcon as any} size={64} color="#cbd5e1" />
          <Text className="text-lg text-slate-500 mt-4 text-center">
            {emptyMessage}
          </Text>
        </View>
      }
    />
  );
}

export function DashboardList<T = unknown>(props: DashboardListProps<T>) {
  if (props.variant === "menu") {
    return <MenuList items={props.items} onPress={props.onPress} />;
  }

  return <DataList {...props} />;
}
