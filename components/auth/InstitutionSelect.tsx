import { Building2 } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

export type InstitutionItem = {
  label: string;
  value: string;
};

type InstitutionSelectProps = {
  items: InstitutionItem[];
  value: string | null;
  onChange: (value: string | null) => void;
  loading?: boolean;
  error?: string;
};

export function InstitutionSelect({
  items,
  value,
  onChange,
  loading = false,
  error,
}: InstitutionSelectProps) {
  const [open, setOpen] = useState(false);

  const placeholder = loading
    ? "Carregando instituições..."
    : "Selecione uma opção";

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Instituição
      </Text>

      <View className="flex-row items-center">
        <View className="absolute left-4 z-10">
          <Building2 size={20} color="#64748b" />
        </View>

        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={(callback) => onChange(callback(value))}
          disabled={loading}
          listMode="MODAL"
          modalTitle="Instituição"
          placeholder={placeholder}
          style={{
            minHeight: 56,
            paddingLeft: 46,
            borderRadius: 16,
            borderColor: error ? "#ef4444" : "#e2e8f0",
            backgroundColor: "#f8fafc",
          }}
          textStyle={{ fontSize: 16, fontWeight: "600", color: "#0f172a" }}
          placeholderStyle={{ color: "#94a3b8", fontWeight: "500" }}
        />
      </View>

      {error ? (
        <Text
          className="mt-2 text-xs font-semibold text-red-600"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
