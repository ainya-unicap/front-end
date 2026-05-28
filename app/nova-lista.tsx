import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import HeaderStack from "@/components/navigation/headerStack";
import Warning from "@/components/forms/warning";
import { PlantOptionCard } from "@/components/nova-lista/PlantOptionCard";
import { AnalysisTypeCard } from "@/components/nova-lista/AnalysisTypeCard";
import { LabeledField } from "@/components/nova-lista/LabeledField";

// ---------------------------------------------------------------------------
// DADOS MOCKADOS — substituir pelos dados reais do BD.
//
// - Plantas: criar `getPlantas()` / `getPlantCatalog()` em services/api.ts e
//   carregar via useEffect, guardando o resultado em estado no lugar de
//   MOCK_PLANTS. O formato { id, name, icon } já espelha o catálogo esperado.
// - Turmas: criar `getTurmas(userId)` em services/api.ts e popular MOCK_TURMAS.
// ---------------------------------------------------------------------------
type PlantOption = {
  id: string;
  name: string;
  icon: string;
};

const MOCK_PLANTS: PlantOption[] = [
  { id: "plant-1", name: "Capim Massai", icon: "🌱" },
  { id: "plant-2", name: "Braquiária", icon: "🌿" },
  { id: "plant-3", name: "Estilosantes", icon: "🍀" },
];

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

const MOCK_TURMAS = [
  "Agronomia 2026.1 — Manhã",
  "Agronomia 2026.1 — Noite",
  "Zootecnia 2026.1 — Manhã",
];

export default function NovaListaScreen() {
  const [plantId, setPlantId] = useState<string>(MOCK_PLANTS[0].id);
  const [analysisTypeId, setAnalysisTypeId] = useState<string>(
    ANALYSIS_TYPES[0].id
  );
  const [nomeCanteiro, setNomeCanteiro] = useState("");
  const [periodoLetivo, setPeriodoLetivo] = useState("2026.1");
  const [turma, setTurma] = useState<string | null>(null);
  const [turmaOpen, setTurmaOpen] = useState(false);

  function handleCreate() {
    // TODO(BD): chamar o endpoint real de criação de lista/canteiro.
    // Sugestão de payload (ajustar aos nomes do back-end):
    // {
    //   plant_id: plantId,
    //   analysis_type: analysisTypeId,
    //   name: nomeCanteiro,
    //   period: periodoLetivo,
    //   turma,
    //   user_id: <id do usuário logado>,
    // }
    console.log("Criar lista de formulários", {
      plantId,
      analysisTypeId,
      nomeCanteiro,
      periodoLetivo,
      turma,
    });

    router.back();
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 -mx-1 px-1"
        >
          {MOCK_PLANTS.map((plant) => (
            <PlantOptionCard
              key={plant.id}
              name={plant.name}
              icon={plant.icon}
              selected={plant.id === plantId}
              onPress={() => setPlantId(plant.id)}
            />
          ))}
        </ScrollView>

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
                {MOCK_TURMAS.map((option, index) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setTurma(option);
                      setTurmaOpen(false);
                    }}
                    className={`px-4 py-3 active:bg-slate-50 ${
                      index < MOCK_TURMAS.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <Text className="text-base text-slate-700">{option}</Text>
                  </Pressable>
                ))}
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
          className="h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80"
        >
          <Text className="text-base font-bold text-white">
            Criar lista de formulários
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
