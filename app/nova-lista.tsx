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

import { getPlantas } from "@/database/plantasForrageiras";
import { getUserTurmas } from "@/database/turmas";
import { createCanteiro } from "@/database/canteiros";
import { createListaFormulario } from "@/database/listasFormularios";
import { getUserId } from "@/database/auth";

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
    name: planta.nome_comum ?? planta.name ?? "Planta",
    icon: CATEGORY_ICON[planta.category] ?? "🌱",
  };
}

type AnalysisType = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
};

const ANALYSIS_TYPES: AnalysisType[] = [
  {
    id: "1-semestre",
    title: "1º Semestre",
    subtitle: "Cultivar, manejar e caracterizar",
    icon: "🌱",
  },
  {
    id: "2-semestre",
    title: "2º Semestre",
    subtitle: "Fatores ecológicos",
    icon: "🌍",
  },
];

export default function NovaListaScreen() {
  // Catálogo de plantas e turmas vindos da API
  const { data: plantasData, isLoading: loadingPlantas } = useSWR(
    "plantas",
    () => getPlantas()
  );
  const { data: turmasData } = useSWR("user-turmas", () => getUserTurmas());

  const plantasArr = Array.isArray(plantasData)
    ? plantasData
    : (plantasData?.data ?? []);
  const turmasArr = Array.isArray(turmasData)
    ? turmasData
    : (turmasData?.data ?? []);

  const plantas: PlantOption[] = plantasArr.map(mapPlanta);
  // getUserTurmas devolve vínculos aluno-turma; extraímos o nome de forma tolerante
  const turmas: { id: string; nome: string }[] = turmasArr.map(
    (t: any) => ({
      id: String(t.turma?.id ?? t.turma_id ?? t.id),
      nome: t.turma?.name ?? t.name ?? "Turma",
    })
  );

  const [plantId, setPlantId] = useState<string>("");
  const [analysisTypeId, setAnalysisTypeId] = useState<string>(
    ANALYSIS_TYPES[0].id
  );
  const [nomeCanteiro, setNomeCanteiro] = useState("");
  const [periodoLetivo, setPeriodoLetivo] = useState("2026.1");
  const [turma, setTurma] = useState<string | null>(null);
  const [turmaOpen, setTurmaOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seleciona a primeira planta assim que o catálogo carrega
  useEffect(() => {
    if (!plantId && plantas.length > 0) {
      setPlantId(plantas[0].id);
    }
  }, [plantas, plantId]);

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

      // 1) cria o canteiro vinculado ao usuário logado e à planta escolhida
      const canteiro = await createCanteiro({
        plant_id: plantId,
        name: nomeCanteiro.trim(),
        user_id: getUserId() ?? undefined,
      });
      const canteiroId =
        canteiro?.id ?? canteiro?.data?.id ?? canteiro?.canteiro?.id;

      // 2) cria a lista de formulários vinculada ao canteiro
      await createListaFormulario({
        canteiro_id: canteiroId,
        name: nomeCanteiro.trim(),
      });

      // 3) revalida o cache da lista de canteiros (telas Canteiros e Novo relatório)
      await mutate("user-canteiros");

      Alert.alert("Pronto!", "Lista de formulários criada com sucesso.");
      router.back();
    } catch (error) {
      console.error("Erro ao criar lista de formulários:", error);
      Alert.alert(
        "Erro ao criar",
        "Não foi possível criar a lista de formulários agora."
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
              onChangeText={setPeriodoLetivo}
              placeholder="2026.1"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
            />
          </LabeledField>

          <LabeledField label="Turma">
            <Pressable
              onPress={() => setTurmaOpen((open) => !open)}
              className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-80"
            >
              <Text
                className={`text-base ${
                  turma ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {turma || "Selecionar turma"}
              </Text>
              <Text className="text-slate-400">▾</Text>
            </Pressable>

            {turmaOpen && (
              <View className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {turmas.length === 0 ? (
                  <Text className="px-4 py-3 text-base text-slate-400">
                    Nenhuma turma vinculada
                  </Text>
                ) : (
                  turmas.map((option, index) => (
                    <Pressable
                      key={option.id}
                      onPress={() => {
                        setTurma(option.nome);
                        setTurmaOpen(false);
                      }}
                      className={`px-4 py-3 active:bg-slate-50 ${
                        index < turmas.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <Text className="text-base text-slate-700">
                        {option.nome}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}
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
