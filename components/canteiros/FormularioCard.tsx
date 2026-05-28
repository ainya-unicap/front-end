import { Pressable, Text, View } from "react-native";

import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";

type FormularioStatus = "COMPLETO" | "RASCUNHO" | "PENDENTE";

type FormularioCardProps = {
  week: number;
  status: FormularioStatus;
  dateLabel: string;
  photos: number;
  checklistDone: number;
  checklistTotal: number;
  progress: number;
  onPress?: () => void;
};

const STATUS_VARIANT = {
  COMPLETO: "green",
  RASCUNHO: "amber",
  PENDENTE: "gray",
} as const;

export function FormularioCard({
  week,
  status,
  dateLabel,
  photos,
  checklistDone,
  checklistTotal,
  progress,
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

        <StatusBadge label={status} variant={STATUS_VARIANT[status]} />
      </View>

      <Text className="mb-3 text-sm text-slate-400">{dateLabel}</Text>

      <View className="flex-row items-center gap-3">
        <Text className="text-sm text-slate-500">📷 {photos}</Text>

        <Text className="text-sm text-slate-500">
          ✅ {checklistDone}/{checklistTotal}
        </Text>

        <ProgressBar value={progress} />

        <Text className="text-sm font-bold text-slate-700">{progress}%</Text>
      </View>
    </Pressable>
  );
}
