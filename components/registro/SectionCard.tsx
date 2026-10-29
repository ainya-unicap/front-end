import { ReactNode } from "react";
import { Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

type SectionCardProps = {
  title: string;
  icon?: AppIconName;
  children: ReactNode;
};

export function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <View className="mb-4 flex-row items-center">
        {icon ? (
          <View className="mr-2">
            <AppIcon name={icon} size={18} color="#065f46" />
          </View>
        ) : null}
        <Text className="text-sm font-extrabold uppercase tracking-wide text-emerald-900">
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}