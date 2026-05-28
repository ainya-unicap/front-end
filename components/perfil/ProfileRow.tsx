import { Pressable, Text, View } from "react-native";

type ProfileRowProps = {
  icon: string;
  label: string;
  value?: string;
  iconBg?: string;
  onPress?: () => void;
  isLast?: boolean;
};

export function ProfileRow({
  icon,
  label,
  value,
  iconBg = "bg-slate-100",
  onPress,
  isLast,
}: ProfileRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-3 active:opacity-80 ${
        isLast ? "" : "border-b border-slate-100"
      }`}
    >
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Text className="text-lg">{icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">{label}</Text>
        {value ? (
          <Text className="mt-0.5 text-sm text-slate-400">{value}</Text>
        ) : null}
      </View>

      <Text className="text-xl text-slate-300">›</Text>
    </Pressable>
  );
}
