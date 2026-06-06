import { Pressable, Text, View } from "react-native";

import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";

type CanteiroCardProps = {
  icon: string;
  name: string;
  description: string;
  totalRegistros: number;
  lastRecord: string;
  status: "ATIVO" | "PAUSADO";
  progress: number;
  onPress?: () => void;
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
}: CanteiroCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 rounded-2xl bg-white p-4 shadow-sm active:opacity-80"
    >
      <View className="mb-3 flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <Text className="text-2xl">{icon}</Text>
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
        <Text className="text-sm text-slate-400">📅 Último: {lastRecord}</Text>

        <StatusBadge
          label={status}
          variant={status === "ATIVO" ? "green" : "gray"}
        />
      </View>
    </Pressable>
  );
}
