import { Text, TextInput, View } from "react-native";

type FieldBoxProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

const DATE_LABELS = ["data", "início", "término"];

function formatDateBR(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function FieldBox({ label, value, onChangeText, placeholder }: FieldBoxProps) {
  const isDateField = DATE_LABELS.includes(label.toLowerCase());

  function handleChangeText(text: string) {
    onChangeText(isDateField ? formatDateBR(text) : text);
  }

  return (
    <View className="mb-4 w-[48%]">
      <Text className="mb-2 text-xs font-bold uppercase text-slate-400">
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder ?? (isDateField ? "dd/mm/aaaa" : undefined)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
      />
    </View>
  );
}