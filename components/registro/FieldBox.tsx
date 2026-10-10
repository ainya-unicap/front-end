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
      <Text className="mb-2 text-sm font-bold uppercase text-slate-600">
        {label}
      </Text>

      {/* View externa que controla a caixa, a borda e força o alinhamento vertical */}
      <View className="h-[52px] justify-center rounded-xl border border-slate-300 bg-white px-4">
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder ?? (isDateField ? "dd/mm/aaaa" : undefined)}
          // TextInput totalmente limpo de margens para não empurrar o texto
          className="text-lg font-medium text-slate-800 p-0 m-0 leading-tight"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          style={{ paddingVertical: 0, marginVertical: 0 }}
        />
      </View>
    </View>
  );
}