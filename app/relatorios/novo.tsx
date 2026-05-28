import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import HeaderStack from "@/components/navigation/headerStack";
import { SectionCard } from "@/components/registro/SectionCard";
import { AnalysisTypeCard } from "@/components/nova-lista/AnalysisTypeCard";
import { Stepper } from "@/components/relatorios/Stepper";
import { CanteiroSelectCard } from "@/components/relatorios/CanteiroSelectCard";

// ---------------------------------------------------------------------------
// DADOS MOCKADOS — substituir por getCanteirosByUser(userId) (services/api.ts).
// Mapear cada CanteiroResumo:
//   name       -> plant?.name
//   totalForms -> listaDeFormularios?.[0]?._count?.formularios
//   location   -> name do canteiro (ex.: "Canteiro A — Bloco 3")
//   weeks      -> derivar das semanas dos formulários (mostradas em chips)
// ---------------------------------------------------------------------------
type CanteiroOption = {
  id: string;
  icon: string;
  name: string;
  totalForms: number;
  location: string;
  weeks: string[];
  extraCount: number;
};

const MOCK_CANTEIROS: CanteiroOption[] = [
  {
    id: "canteiro-1",
    icon: "🌱",
    name: "Capim Massai",
    totalForms: 12,
    location: "Canteiro A — Bloco 3",
    weeks: ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4", "Sem. 5"],
    extraCount: 7,
  },
  {
    id: "canteiro-2",
    icon: "🌿",
    name: "Braquiária Ruziziensis",
    totalForms: 8,
    location: "Canteiro B",
    weeks: ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4", "Sem. 5"],
    extraCount: 3,
  },
  {
    id: "canteiro-3",
    icon: "🍀",
    name: "Estilosantes",
    totalForms: 5,
    location: "Canteiro C",
    weeks: ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4", "Sem. 5"],
    extraCount: 0,
  },
];

type ReportType = "simples" | "analise";

export default function NovoRelatorioScreen() {
  const [canteiroId, setCanteiroId] = useState(MOCK_CANTEIROS[0].id);
  const [reportType, setReportType] = useState<ReportType>("simples");

  const canteiro = useMemo(
    () => MOCK_CANTEIROS.find((item) => item.id === canteiroId) ?? MOCK_CANTEIROS[0],
    [canteiroId]
  );

  function handleGerar() {
    // TODO(BD/IA): chamar o endpoint de geração do relatório, ex.:
    // { canteiro_id: canteiroId, type: reportType } -> retorna o id do
    // relatório criado (com as 5 seções preenchidas pela IA).
    // Por enquanto navega para a tela de edição do relatório (mock).
    router.push({
      pathname: "/relatorios/[id]",
      params: { id: canteiroId },
    });
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <HeaderStack title="Novo relatório" />

        <View className="mb-6">
          <Stepper steps={["Canteiro", "Gerar"]} current={0} />
        </View>

        <SectionCard title="Escolha o canteiro" icon="🌱">
          <Text className="mb-4 text-sm leading-5 text-slate-400">
            A lista de formulários do canteiro será usada como base para a IA
            gerar o relatório automaticamente.
          </Text>

          {MOCK_CANTEIROS.map((item) => (
            <CanteiroSelectCard
              key={item.id}
              icon={item.icon}
              name={item.name}
              subtitle={`${item.totalForms} formulários · ${item.location}`}
              selected={item.id === canteiroId}
              weeks={item.weeks}
              extraCount={item.extraCount}
              onPress={() => setCanteiroId(item.id)}
            />
          ))}
        </SectionCard>

        <SectionCard title="Tipo de relatório" icon="📄">
          <View className="flex-row gap-3">
            <AnalysisTypeCard
              icon="📋"
              title="Relatório simples"
              subtitle="Seções obrigatórias"
              selected={reportType === "simples"}
              onPress={() => setReportType("simples")}
            />

            <AnalysisTypeCard
              icon="📊"
              title="Com análise"
              subtitle="+ gráficos e análises"
              selected={reportType === "analise"}
              onPress={() => setReportType("analise")}
            />
          </View>
        </SectionCard>

        <View className="flex-row rounded-2xl bg-emerald-50 p-4">
          <Text className="mr-2 text-base">✨</Text>
          <Text className="flex-1 text-sm leading-5 text-slate-600">
            <Text className="font-bold text-emerald-900">
              A IA vai gerar o relatório{"\n"}
            </Text>
            Com base nos {canteiro.totalForms} formulários do {canteiro.name}, a
            IA vai preencher automaticamente a Introdução, Objetivo,
            Desenvolvimento e Considerações finais. Você poderá editar tudo antes
            de submeter.
          </Text>
        </View>
      </ScrollView>

      {/* Footer fixo com a ação principal */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-slate-50 px-5 pb-8 pt-3">
        <Pressable
          onPress={handleGerar}
          className="h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80"
        >
          <Text className="text-base font-bold text-white">
            ✨ Gerar relatório com IA
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
