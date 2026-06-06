import { ReactNode } from "react";
import { Text, View } from "react-native";

type LabeledFieldProps = {
  label: string;
  children: ReactNode;
};

export function LabeledField({ label, children }: LabeledFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </Text>

      {children}
    </View>
  );
}
