import { Pressable, Text, View } from "react-native";

type QuickActionCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export function QuickActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[48%] rounded-2xl bg-white p-4 shadow-sm active:opacity-80 md:flex-1"
    >
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
        <Text className="text-xl">{icon}</Text>
      </View>

      <Text className="text-base font-bold text-slate-900">{title}</Text>
      <Text className="mt-1 text-sm text-slate-400">{subtitle}</Text>
    </Pressable>
  );
}