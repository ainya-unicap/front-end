import { ReactNode } from "react";
import { Text, View } from "react-native";

type ProfileSectionProps = {
  title: string;
  children: ReactNode;
};

export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </Text>

      <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {children}
      </View>
    </View>
  );
}
