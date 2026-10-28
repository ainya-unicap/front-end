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

import { finalizarFormulario, getFormularioById } from "@/database/formularios";

import { SuccessCard } from "@/components/registro-salvo/SuccessCard";
import { SummaryMetricCard } from "@/components/registro-salvo/SummaryMetricCard";
import { SavedSectionCard } from "@/components/registro-salvo/SavedSectionCard";
import { PhotoPreviewList } from "@/components/registro-salvo/PhotoPreviewList";
import { MeasurementList } from "@/components/registro-salvo/MeasurementList";
import { SavedChecklistList } from "@/components/registro-salvo/SavedChecklistList";
import { Skeleton } from "@/components/ui/Skeleton";

function formatDateTimeRange(formulario: any) {
  const start = new Date(formulario.started_at || formulario.createdAt);
  const recordDate = new Date(
    formulario.date || formulario.started_at || formulario.createdAt
  );
  const displayDate = Number.isNaN(recordDate.getTime()) ? start : recordDate;

  const end = formulario.ended_at ? new Date(formulario.ended_at) : null;

  const date = displayDate.toLocaleDateString("pt-BR", {
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

const checklistFields = [
  { key: "checklist_irrigacao", label: "Irrigação realizada" },
  { key: "checklist_capina", label: "Limpeza / Capina" },
  { key: "checklist_adubacao", label: "Adubação de cobertura" },
  { key: "checklist_plantio", label: "Plantio / Replantio" },
  { key: "checklist_pragas", label: "Controle de pragas" },
] as const;

function getChecklistItems(formulario: any) {
  const hasNewChecklist = checklistFields.some(
    ({ key }) => typeof formulario[key] === "boolean"
  );

  if (!hasNewChecklist) return formulario.checklists || [];

  return checklistFields.map(({ key, label }) => ({
    id: key,
    checked: formulario[key] === true,
    template: { field_name: label },
  }));
}

function getWeatherLabel(weather?: string) {
  return (
    {
      SOL: "Sol",
      NUBLADO: "Nublado",
      CHUVA: "Chuva",
    }[weather ?? ""] ?? weather ?? "—"
  );
}

function getPhenologicalStageLabel(stage?: string) {
  return (
    {
      VEGETATIVO: "Vegetativo",
      ELONGACAO: "Elongação",
      FLORESCIMENTO: "Florescimento",
    }[stage ?? ""] ?? stage ?? "—"
  );
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

  const [finalizing, setFinalizing] = useState(false);

  const subtitle = useMemo(
    () => (formulario ? formatDateTimeRange(formulario) : ""),
    [formulario]
  );

  // Registro incompleto (envio interrompido): marca como completo no servidor
  async function handleFinalizar() {
    try {
      setFinalizing(true);
      await finalizarFormulario(String(id));
      await mutate();
      Alert.alert("Pronto", "Registro marcado como completo.");
    } catch (error) {
      console.log("Erro ao finalizar:", error);
      Alert.alert(
        "Não foi possível finalizar",
        "Verifique sua conexão e tente novamente."
      );
    } finally {
      setFinalizing(false);
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

  const altura =
    formulario.estimated_height_cm != null
      ? `${formulario.estimated_height_cm} cm`
      : getMeasurementValue(formulario, "altura");
  const cobertura = getMeasurementValue(formulario, "cobertura");
  const totalFotos = formulario.photos?.length || 0;
  const checklistItems = getChecklistItems(formulario);
  const totalChecklist = checklistItems.length;
  const totalChecklistChecked =
    checklistItems.filter((item: any) => item.checked).length || 0;
  const measurements =
    formulario.estimated_height_cm != null
      ? (formulario.measurements || []).filter(
          (measurement: any) =>
            !measurement.template?.field_name?.toLowerCase().includes("altura")
        )
      : formulario.measurements || [];

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
            onPress={() => router.push({ pathname: "/registro", params: { id: String(id) } })}
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
          <MeasurementList measurements={measurements} />
        </SavedSectionCard>

        <SavedSectionCard title="Dados do registro" icon="🌱">
          {[
            ["Título", formulario.title],
            ["Semana", formulario.week != null ? String(formulario.week) : "—"],
            ["Clima", getWeatherLabel(formulario.weather)],
            ["Fase da planta", getPhenologicalStageLabel(formulario.phenological_stage)],
          ].map(([label, value]) => (
            <View
              key={label}
              className="flex-row items-center justify-between border-b border-slate-100 py-3"
            >
              <Text className="flex-1 text-base text-slate-500">{label}</Text>
              <Text className="flex-1 text-right text-base font-bold text-emerald-950">
                {value || "—"}
              </Text>
            </View>
          ))}
        </SavedSectionCard>

        <SavedSectionCard
          title={`Checklist (${totalChecklistChecked}/${totalChecklist})`}
          icon="✅"
        >
          <SavedChecklistList items={checklistItems} />
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

          {!formulario.synced ? (
            <Pressable
              onPress={handleFinalizar}
              disabled={finalizing}
              className="h-14 flex-1 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
            >
              {finalizing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Finalizar registro
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
