import { Text, View } from "react-native";

type SummaryMetricCardProps = {
  value: string;
  label: string;
};

export function SummaryMetricCard({ value, label }: SummaryMetricCardProps) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-white px-3 py-4 shadow-sm">
      <Text className="text-2xl font-extrabold text-emerald-900">{value}</Text>
      <Text className="mt-1 text-center text-xs text-slate-400">{label}</Text>
    </View>
  );
}