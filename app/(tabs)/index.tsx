import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import useSWR from "swr";

import { getFormulariosByUser } from "@/database/formularios";
import { getRelatorios } from "@/database/relatorios";
import { type AlunoResumo, type FormularioResumo } from "@/services/api";

import { HomeHeader } from "@/components/home/HomeHeader";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { RecentRecordCard } from "@/components/home/RecentRecordCard";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { Skeleton } from "@/components/ui/Skeleton";

// Extrai um array independentemente do formato que a API devolver
// (array puro, { data: [...] }, { formularios: [...] }, etc.)
function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.formularios)) return value.formularios;
  if (Array.isArray(value?.relatorios)) return value.relatorios;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

// Chave de "semana" de um formulário (usada para contar semanas distintas)
function weekKey(formulario: any): string {
  if (formulario.semana != null) return String(formulario.semana);
  const raw = formulario.createdAt ?? formulario.data_preenchimento ?? "";
  return String(raw).slice(0, 10);
}

export default function HomeScreen() {
  const { data: formulariosData, isLoading: loadingForms } = useSWR(
    "home-formularios",
    getFormulariosByUser
  );
  const { data: relatoriosData, isLoading: loadingRel } = useSWR(
    "home-relatorios",
    getRelatorios
  );

  const loading = loadingForms || loadingRel;

  const formularios = toArray(formulariosData) as FormularioResumo[];
  const relatorios = toArray(relatoriosData);

  // Estatísticas derivadas dos dados reais do aluno
  const resumo: AlunoResumo = useMemo(
    () => ({
      total_formularios: formularios.length,
      total_semanas: new Set(formularios.map(weekKey)).size,
      total_relatorios: relatorios.length,
    }),
    [formularios, relatorios]
  );

  const registrosRecentes = formularios.slice(0, 3);

  return (
    <View className="flex-1 bg-slate-50">
      <HomeHeader resumo={resumo} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-32 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <Text className="text-2xl font-bold text-slate-950">Ações rápidas</Text>
        </View>

        <View className="mb-8 flex-row flex-wrap justify-between gap-y-3">
          <QuickActionCard
            icon="📝"
            title="Novo Registro"
            subtitle="Registro semanal"
            onPress={() => router.push("/registro")}
          />

          <QuickActionCard
            icon="🌱"
            title="Canteiros"
            subtitle="Minhas plantas"
            onPress={() => router.push("/nova-lista")}
          />

          <QuickActionCard
            icon="📄"
            title="Relatório"
            subtitle="Gerar ou editar"
            onPress={() => router.push("/relatorios")}
          />

          <QuickActionCard
            icon="📊"
            title="Histórico"
            subtitle="Evolução"
            onPress={() => router.push("/relatorios")}
          />
        </View>

        <Text className="mb-3 text-2xl font-bold text-slate-950">
          Registros recentes
        </Text>

        {loading ? (
          <View className="gap-3">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="flex-row items-center rounded-2xl bg-white px-4 py-4"
              >
                <Skeleton width={12} height={12} radius={6} />
                <View className="ml-4 flex-1 gap-2">
                  <Skeleton width="70%" height={16} />
                  <Skeleton width="40%" height={12} />
                </View>
              </View>
            ))}
          </View>
        ) : registrosRecentes.length === 0 ? (
          <View className="items-center rounded-2xl bg-white p-8">
            <Text className="text-base font-semibold text-slate-500">
              Nenhum registro ainda
            </Text>
            <Text className="mt-1 text-sm text-slate-400">
              Crie seu primeiro registro semanal
            </Text>
          </View>
        ) : (
          registrosRecentes.map((item) => (
            <RecentRecordCard key={item.id} item={item} />
          ))
        )}
      </ScrollView>

      <BottomNavbar active="home" />
    </View>
  );
}
