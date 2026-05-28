import { Text, View } from "react-native";

type StatusVariant = "green" | "amber" | "gray";

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
};

const BG: Record<StatusVariant, string> = {
  green: "bg-emerald-100",
  amber: "bg-amber-100",
  gray: "bg-slate-200",
};

const TEXT: Record<StatusVariant, string> = {
  green: "text-emerald-700",
  amber: "text-amber-700",
  gray: "text-slate-500",
};

export function StatusBadge({ label, variant = "green" }: StatusBadgeProps) {
  return (
    <View className={`rounded-full px-2.5 py-1 ${BG[variant]}`}>
      <Text className={`text-[10px] font-bold uppercase ${TEXT[variant]}`}>
        {label}
      </Text>
    </View>
  );
}
