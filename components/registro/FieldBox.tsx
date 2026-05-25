import { Text, TextInput, View } from "react-native";

type FieldBoxProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function FieldBox({
  label,
  value,
  onChangeText,
  placeholder,
}: FieldBoxProps) {
  return (
    <View className="mb-4 w-[48%]">
      <Text className="mb-2 text-xs font-bold uppercase text-slate-400">
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}