import { Pressable, Text } from "react-native";

type AnalysisTypeCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  selected?: boolean;
  onPress?: () => void;
};

export function AnalysisTypeCard({
  title,
  subtitle,
  icon,
  selected,
  onPress,
}: AnalysisTypeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl border p-4 active:opacity-80 ${
        selected
          ? "border-emerald-700 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <Text className="mb-2 text-2xl">{icon}</Text>

      <Text
        className={`text-base font-bold ${
          selected ? "text-emerald-900" : "text-slate-700"
        }`}
      >
        {title}
      </Text>

      <Text
        className={`mt-1 text-xs ${
          selected ? "text-emerald-700" : "text-slate-400"
        }`}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}
