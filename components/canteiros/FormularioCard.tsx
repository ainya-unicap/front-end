import { Pressable, Text, View } from "react-native";
import { AppIcon } from "@/components/ui/AppIcon";

import { StatusBadge } from "./StatusBadge";

type FormularioCardProps = {
  week: number;
  // false = registro que ficou incompleto no meio do envio
  complete: boolean;
  dateLabel: string;
  photos: number;
  onPress?: () => void;
};

export function FormularioCard({
  week,
  complete,
  dateLabel,
  photos,
  onPress,
}: FormularioCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 rounded-2xl bg-white p-4 shadow-sm active:opacity-80"
    >
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="flex-1 pr-2 text-base font-bold text-slate-900">
          Semana {week} — Registro semanal
        </Text>

        {/* Só destaca o registro que precisa de atenção */}
        {complete ? null : <StatusBadge label="INCOMPLETO" variant="amber" />}
      </View>

      <Text className="mb-3 text-sm text-slate-400">{dateLabel}</Text>

      <View className="flex-row items-center">
        <AppIcon name="camera" size={16} color="#64748b" />
        <Text className="ml-1 text-sm text-slate-500">
          {photos} {photos === 1 ? "foto" : "fotos"}
        </Text>
      </View>
    </Pressable>
  );
}
