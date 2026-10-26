import { Pressable, Text } from "react-native";

type AnalysisTypeCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

export function AnalysisTypeCard({
  title,
  subtitle,
  icon,
  selected,
  disabled,
  onPress,
}: AnalysisTypeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 rounded-2xl border p-4 ${
        disabled ? "opacity-50" : "active:opacity-80"
      } ${
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
