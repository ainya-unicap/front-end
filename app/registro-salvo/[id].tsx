import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import useSWR from "swr";

import { getFormularioById, syncFormulario } from "@/database/formularios";

import { SuccessCard } from "@/components/registro-salvo/SuccessCard";
import { SummaryMetricCard } from "@/components/registro-salvo/SummaryMetricCard";
import { SavedSectionCard } from "@/components/registro-salvo/SavedSectionCard";
import { PhotoPreviewList } from "@/components/registro-salvo/PhotoPreviewList";
import { MeasurementList } from "@/components/registro-salvo/MeasurementList";
import { SavedChecklistList } from "@/components/registro-salvo/SavedChecklistList";
import { Skeleton } from "@/components/ui/Skeleton";

function formatDateTimeRange(formulario: any) {
  const start = formulario.started_at
    ? new Date(formulario.started_at)
    : new Date(formulario.createdAt);

  const end = formulario.ended_at ? new Date(formulario.ended_at) : null;

  const date = start.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const startTime = start.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = end
    ? end.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return `${date} · ${startTime} – ${endTime}`;
}

function getMeasurementValue(formulario: any, keyword: string) {
  const measurement = formulario.measurements?.find((item: any) =>
    item.template?.field_name?.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!measurement) return "—";

  return `${measurement.value}${measurement.template?.unit || ""}`;
}

export default function RegistroSalvoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: formularioResp,
    isLoading,
    mutate,
  } = useSWR(id ? `formulario-${id}` : null, () => getFormularioById(id));

  // A API pode devolver o objeto direto ou embrulhado em { data: {...} }
  const formulario = (formularioResp as any)?.data ?? formularioResp;

  const [syncing, setSyncing] = useState(false);

  const subtitle = useMemo(
    () => (formulario ? formatDateTimeRange(formulario) : ""),
    [formulario]
  );

  async function handleSync() {
    try {
      setSyncing(true);
      await syncFormulario(String(id));
      await mutate();
      Alert.alert("Sincronizado", "Registro sincronizado com sucesso.");
    } catch (error) {
      console.log("Erro ao sincronizar:", error);
      Alert.alert(
        "Não sincronizado",
        "Não foi possível sincronizar agora. Tente novamente depois."
      );
    } finally {
      setSyncing(false);
    }
  }

  if (isLoading || !formulario) {
    return (
      <View className="flex-1 bg-slate-50">
        <ScrollView contentContainerClassName="px-5 pb-10 pt-14">
          <Skeleton width="60%" height={28} radius={8} />
          <View className="mt-6 gap-3">
            <Skeleton width="100%" height={96} radius={16} />
            <View className="flex-row gap-3">
              <Skeleton width="31%" height={72} radius={16} />
              <Skeleton width="31%" height={72} radius={16} />
              <Skeleton width="31%" height={72} radius={16} />
            </View>
            <Skeleton width="100%" height={140} radius={16} />
            <Skeleton width="100%" height={140} radius={16} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const altura = getMeasurementValue(formulario, "altura");
  const cobertura = getMeasurementValue(formulario, "cobertura");
  const totalFotos = formulario.photos?.length || 0;
  const totalChecklist = formulario.checklists?.length || 0;
  const totalChecklistChecked =
    formulario.checklists?.filter((item: any) => item.checked).length || 0;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-14"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-slate-100"
          >
            <Text className="text-2xl text-slate-500">‹</Text>
          </Pressable>

          <Text className="flex-1 px-4 text-2xl font-bold text-slate-950">
            Registro Salvo
          </Text>

          <Pressable
            onPress={() => router.push("/registro")}
            className="rounded-full bg-emerald-100 px-4 py-3 active:opacity-80"
          >
            <Text className="text-sm font-bold text-emerald-800">✏️ Editar</Text>
          </Pressable>
        </View>

        <SuccessCard
          title="Registro salvo com sucesso!"
          subtitle={subtitle}
          synced={formulario.synced}
        />

        <View className="mb-4 flex-row gap-3">
          <SummaryMetricCard value={altura} label="Altura" />
          <SummaryMetricCard value={cobertura} label="Cobertura" />
          <SummaryMetricCard value={`${totalFotos}`} label="Fotos" />
        </View>

        <SavedSectionCard title="Fotos registradas" icon="📷">
          <PhotoPreviewList photos={formulario.photos || []} />
        </SavedSectionCard>

        <SavedSectionCard title="Medições" icon="📏">
          <MeasurementList measurements={formulario.measurements || []} />
        </SavedSectionCard>

        <SavedSectionCard
          title={`Checklist (${totalChecklistChecked}/${totalChecklist})`}
          icon="✅"
        >
          <SavedChecklistList items={formulario.checklists || []} />
        </SavedSectionCard>

        <SavedSectionCard title="Observações" icon="📝">
          <Text className="text-base leading-6 text-slate-600">
            {formulario.observations || "Nenhuma observação registrada."}
          </Text>
        </SavedSectionCard>

        <View className="mt-2 flex-row gap-3">
          <Pressable
            onPress={() => router.replace("/")}
            className="h-14 flex-1 items-center justify-center rounded-2xl bg-slate-200 active:opacity-80"
          >
            <Text className="text-base font-bold text-slate-700">
              Ir para Home
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSync}
            disabled={syncing}
            className="h-14 flex-1 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
          >
            {syncing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-bold text-white">Sincronizar</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
