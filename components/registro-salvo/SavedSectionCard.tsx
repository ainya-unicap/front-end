import { ReactNode } from "react";
import { Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

type SavedSectionCardProps = {
  title: string;
  icon: AppIconName;
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
        <View className="mr-2">
          <AppIcon name={icon} size={18} color="#065f46" />
        </View>

        <Text className="text-sm font-extrabold uppercase tracking-wide text-emerald-900">
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}