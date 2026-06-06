import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { type FormularioResumo } from "@/services/api";

type RecentRecordCardProps = {
  item: FormularioResumo;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function getWeekNumber(dateString: string) {
  const date = new Date(dateString);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor(
    (date.getTime() - yearStart.getTime()) / 86400000
  );

  return Math.ceil((diffDays + yearStart.getDay() + 1) / 7);
}

export function RecentRecordCard({ item }: RecentRecordCardProps) {
  const plantName = item.list?.plant?.name || "Planta";
  const week = getWeekNumber(item.createdAt);
  const status = item.synced ? "Sincronizado" : "Pendente";

  return (
    <Pressable
      onPress={() => router.push(`/registro-salvo/${item.id}`)}
      className="mb-3 flex-row items-center rounded-2xl bg-white px-4 py-4 shadow-sm active:opacity-80 lg:w-[48%]"
    >
      <View
        className={`mr-4 h-3 w-3 rounded-full ${
          item.synced ? "bg-emerald-500" : "bg-amber-400"
        }`}
      />

      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">
          Semana {week} — {plantName}
        </Text>

        <Text className="mt-1 text-sm text-slate-400">
          {formatDate(item.createdAt)} · {status}
        </Text>
      </View>

      <Text className="text-xl text-slate-300">›</Text>
    </Pressable>
  );
}