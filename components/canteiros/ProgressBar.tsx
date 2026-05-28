import { View } from "react-native";

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
      <View
        className="h-full rounded-full bg-emerald-600"
        style={{ width: `${clamped}%` }}
      />
    </View>
  );
}
