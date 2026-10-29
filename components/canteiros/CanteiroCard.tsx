import { Pressable, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";

type CanteiroCardProps = {
  icon: AppIconName;
  name: string;
  description: string;
  totalRegistros: number;
  lastRecord: string;
  status: "ATIVO" | "PAUSADO";
  progress: number;
  onPress?: () => void;
  // Segurar o card (usado para excluir o canteiro)
  onLongPress?: () => void;
};

export function CanteiroCard({
  icon,
  name,
  description,
  totalRegistros,
  lastRecord,
  status,
  progress,
  onPress,
  onLongPress,
}: CanteiroCardProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityHint="Segure para excluir o canteiro"
      className="mb-4 rounded-2xl bg-white p-4 shadow-sm active:opacity-80"
    >
      <View className="mb-3 flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <AppIcon name={icon} size={28} />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">{name}</Text>
          <Text className="mt-0.5 text-sm text-slate-400">
            {description} · {totalRegistros} registros
          </Text>
        </View>
      </View>

      <ProgressBar value={progress} />

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <AppIcon name="calendar" size={16} color="#94a3b8" />
          <Text className="ml-1 text-sm text-slate-400">Último: {lastRecord}</Text>
        </View>

        <StatusBadge
          label={status}
          variant={status === "ATIVO" ? "green" : "gray"}
        />
      </View>
    </Pressable>
  );
}
