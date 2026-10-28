import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import useSWR, { mutate } from "swr";

import { getPlantas, type SemesterFocus } from "@/database/plantasForrageiras";
import { getProfile } from "@/database/user";
import { createCanteiro } from "@/database/canteiros";
import { extractApiError } from "@/lib/apiError";

import HeaderStack from "@/components/navigation/headerStack";
import Warning from "@/components/forms/warning";
import { PlantOptionCard } from "@/components/nova-lista/PlantOptionCard";
import { AnalysisTypeCard } from "@/components/nova-lista/AnalysisTypeCard";
import { LabeledField } from "@/components/nova-lista/LabeledField";

type PlantOption = {
  id: string;
  name: string;
  icon: string;
};

// Emoji por categoria de planta forrageira (mesmo mapa usado na tela de canteiros)
const CATEGORY_ICON: Record<string, string> = {
  CACTACEA: "🌵",
  CULTURA_ANUAL: "🌾",
  GRAMINEA_PORTE_ALTO: "🌱",
  GRAMINEA_PORTE_BAIXO: "🍀",
  GRAMINEA_PORTE_MEDIO: "🌿",
  LEGUMINOSA_ARBUSTIVA: "🌳",
  LEGUMINOSA_HERBACEA: "🍃",
  OLEAGINOSA_FORRAGEIRA: "🌻",
};

function mapPlanta(planta: any): PlantOption {
  return {
    id: String(planta.id),
    name: planta.name ?? "Planta",
    icon: CATEGORY_ICON[planta.category] ?? "🌱",
  };
}

type AnalysisType = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  // Filtra o catálogo de plantas (plantas com foco AMBOS aparecem nos dois)
  semesterFocus: SemesterFocus;
};

const ANALYSIS_TYPES: AnalysisType[] = [
  {
    id: "1-semestre",
    title: "1º Semestre",
    subtitle: "Cultivar, manejar e caracterizar",
    icon: "🌱",
    semesterFocus: "PRIMEIRO",
  },
  {
    id: "2-semestre",
    title: "2º Semestre",
    subtitle: "Fatores ecológicos",
    icon: "🌍",
    semesterFocus: "SEGUNDO",
  },
];

export default function NovaListaScreen() {
  const [selectedPlantId, setPlantId] = useState<string>("");
  const [analysisTypeId, setAnalysisTypeId] = useState<string>(
    ANALYSIS_TYPES[0].id
  );
  const [nomeCanteiro, setNomeCanteiro] = useState("");
  const [saving, setSaving] = useState(false);

  const semesterFocus = ANALYSIS_TYPES.find(
    (type) => type.id === analysisTypeId
  )?.semesterFocus;

  // Catálogo de plantas filtrado pelo tipo de análise (semestre)
  const {
    data: plantasData,
    isLoading: loadingPlantas,
    error: plantasError,
  } = useSWR(["plantas", semesterFocus], () =>
    getPlantas(undefined, semesterFocus)
  );
  const plantas: PlantOption[] = (
    Array.isArray(plantasData) ? plantasData : (plantasData?.data ?? [])
  ).map(mapPlanta);

  // Período letivo e turma vêm do perfil do aluno; são informativos e opcionais
  const { data: perfilResp } = useSWR("perfil", () => getProfile());
  const perfil = (perfilResp as any)?.data ?? perfilResp;
  const periodoLetivo: string = perfil?.academic_period?.name ?? "";
  const turma: string = perfil?.turma?.name ?? "";

  // Ao trocar de semestre a lista muda: se a planta escolhida saiu do
  // catálogo, vale a primeira da nova lista
  const plantId = plantas.some((plant) => plant.id === selectedPlantId)
    ? selectedPlantId
    : (plantas[0]?.id ?? "");

  async function handleCreate() {
    if (!plantId) {
      Alert.alert("Selecione uma planta", "Escolha a planta do canteiro.");
      return;
    }
    if (!nomeCanteiro.trim()) {
      Alert.alert("Nome obrigatório", "Informe o nome do canteiro.");
      return;
    }

    try {
      setSaving(true);

      // Uma chamada só: o backend cria canteiro, vínculo com o usuário do
      // token e lista de formulários numa transação
      await createCanteiro({
        plant_id: plantId,
        name: nomeCanteiro.trim(),
      });

      // Revalida canteiros (telas Canteiros e Novo relatório) e a home
      await Promise.all([mutate("user-canteiros"), mutate("home")]);

      Alert.alert("Pronto!", "Lista de formulários criada com sucesso.");
      router.back();
    } catch (error) {
      console.error("Erro ao criar lista de formulários:", error);
      Alert.alert(
        "Erro ao criar",
        extractApiError(
          error,
          "Não foi possível criar a lista de formulários agora."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <HeaderStack title="Nova lista de formulários" />

        {/* Escolha a planta */}
        <Text className="mb-3 text-lg font-bold text-slate-900">
          Escolha a planta
        </Text>

        {loadingPlantas ? (
          <ActivityIndicator color="#065f46" className="mb-6" />
        ) : plantasError || plantas.length === 0 ? (
          <Text className="mb-6 text-sm text-slate-400">
            {plantasError
              ? "Não foi possível carregar as plantas."
              : "Nenhuma planta disponível para este semestre."}
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6 -mx-1 px-1"
          >
            {plantas.map((plant) => (
              <PlantOptionCard
                key={plant.id}
                name={plant.name}
                icon={plant.icon}
                selected={plant.id === plantId}
                onPress={() => setPlantId(plant.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* Tipo de análise */}
        <Text className="mb-3 text-lg font-bold text-slate-900">
          Tipo de análise
        </Text>

        <View className="mb-6 flex-row gap-3">
          {ANALYSIS_TYPES.map((type) => (
            <AnalysisTypeCard
              key={type.id}
              title={type.title}
              subtitle={type.subtitle}
              icon={type.icon}
              selected={type.id === analysisTypeId}
              onPress={() => setAnalysisTypeId(type.id)}
            />
          ))}
        </View>

        {/* Configurações */}
        <View className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <Text className="mr-2 text-base">⚙️</Text>
            <Text className="text-sm font-extrabold uppercase tracking-wide text-emerald-900">
              Configurações
            </Text>
          </View>

          <LabeledField label="Nome do canteiro">
            <TextInput
              value={nomeCanteiro}
              onChangeText={setNomeCanteiro}
              placeholder="Ex: Canteiro A — Bloco 3"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
            />
          </LabeledField>

          <LabeledField label="Período letivo">
            <TextInput
              value={periodoLetivo}
              editable={false}
              placeholder="Opcional — defina no perfil"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
            />
          </LabeledField>

          <LabeledField label="Turma">
            <TextInput
              value={turma}
              editable={false}
              placeholder="Opcional — defina no perfil"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
            />
          </LabeledField>
        </View>

        <Warning text="⚠️ Use EPIs adequados. Leve protetor solar e água." />
      </ScrollView>

      {/* Footer fixo com a ação principal */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-slate-50 px-5 pb-8 pt-3">
        <Pressable
          onPress={handleCreate}
          disabled={saving}
          className="h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">
              Criar lista de formulários
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
