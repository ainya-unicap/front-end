import { ReactNode } from "react";
import { Text, View } from "react-native";

type SavedSectionCardProps = {
  title: string;
  icon: string;
  children: ReactNode;
};

export function SavedSectionCard({
  title,
  icon,
  children,
}: SavedSectionCardProps) {
  return (
    <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <View className="mb-4 flex-row items-center">
        <Text className="mr-2 text-base">{icon}</Text>

        <Text className="text-sm font-extrabold uppercase tracking-wide text-emerald-900">
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}