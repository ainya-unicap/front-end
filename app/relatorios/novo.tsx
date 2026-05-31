import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import useSWR from "swr";

import { getCanteirosByUser } from "@/database/canteiros";
import { generateRelatorio } from "@/database/relatoriosService";

import HeaderStack from "@/components/navigation/headerStack";
import { SectionCard } from "@/components/registro/SectionCard";
import { AnalysisTypeCard } from "@/components/nova-lista/AnalysisTypeCard";
import { Stepper } from "@/components/relatorios/Stepper";
import { CanteiroSelectCard } from "@/components/relatorios/CanteiroSelectCard";

type CanteiroOption = {
  id: string;
  listId: string | null;
  icon: string;
  name: string;
  totalForms: number;
  location: string;
  weeks: string[];
  extraCount: number;
};

// Emoji por categoria de planta forrageira
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

function mapCanteiro(canteiro: any): CanteiroOption {
  const lista = canteiro.listaDeFormularios?.[0];
  return {
    id: String(canteiro.id),
    listId: lista?.id ? String(lista.id) : null,
    icon: CATEGORY_ICON[canteiro.plant?.category] ?? "🌱",
    name: canteiro.plant?.name ?? canteiro.name ?? "Canteiro",
    totalForms: lista?._count?.formularios ?? 0,
    location: canteiro.name ?? "",
    weeks: [],
    extraCount: 0,
  };
}

type ReportType = "simples" | "analise";

export default function NovoRelatorioScreen() {
  const { data: canteirosData, isLoading } = useSWR("user-canteiros", () =>
    getCanteirosByUser()
  );

  const canteiros: CanteiroOption[] = useMemo(() => {
    const arr = Array.isArray(canteirosData)
      ? canteirosData
      : (canteirosData?.data ?? []);
    return arr.map(mapCanteiro);
  }, [canteirosData]);

  const [canteiroId, setCanteiroId] = useState("");
  const [reportType, setReportType] = useState<ReportType>("simples");
  const [generating, setGenerating] = useState(false);

  // Seleciona o primeiro canteiro quando a lista carrega
  useEffect(() => {
    if (!canteiroId && canteiros.length > 0) {
      setCanteiroId(canteiros[0].id);
    }
  }, [canteiros, canteiroId]);

  const canteiro = useMemo(
    () => canteiros.find((item) => item.id === canteiroId),
    [canteiros, canteiroId]
  );

  async function handleGerar() {
    if (!canteiro?.listId) {
      Alert.alert(
        "Sem lista de formulários",
        "Este canteiro ainda não possui uma lista de formulários para gerar o relatório."
      );
      return;
    }

    try {
      setGenerating(true);

      // A IA gera o relatório a partir da lista de formulários do canteiro
      const relatorio = await generateRelatorio({ list_id: canteiro.listId });
      const relatorioId =
        relatorio?.id ?? relatorio?.data?.id ?? relatorio?.relatorio?.id;

      router.push({
        pathname: "/relatorios/[id]",
        params: { id: String(relatorioId) },
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      Alert.alert(
        "Erro ao gerar",
        "Não foi possível gerar o relatório agora. Tente novamente."
      );
    } finally {
      setGenerating(false);
    }
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

          {isLoading ? (
            <ActivityIndicator color="#065f46" />
          ) : canteiros.length === 0 ? (
            <Text className="text-sm text-slate-400">
              Nenhum canteiro cadastrado ainda.
            </Text>
          ) : (
            canteiros.map((item) => (
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
            ))
          )}
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
            Com base nos {canteiro?.totalForms ?? 0} formulários do{" "}
            {canteiro?.name ?? "canteiro"}, a IA vai preencher automaticamente a
            Introdução, Objetivo, Desenvolvimento e Considerações finais. Você
            poderá editar tudo antes de submeter.
          </Text>
        </View>
      </ScrollView>

      {/* Footer fixo com a ação principal */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-slate-50 px-5 pb-8 pt-3">
        <Pressable
          onPress={handleGerar}
          disabled={generating}
          className="h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
        >
          {generating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">
              ✨ Gerar relatório com IA
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
