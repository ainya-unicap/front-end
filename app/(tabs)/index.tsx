import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import useSWR from "swr";
import { StatusBar } from "expo-status-bar";

import { getAlunoHome } from "@/database/alunos";
import { getProfile } from "@/database/user";
import { type AlunoResumo } from "@/services/api";

import { HomeHeader } from "@/components/home/HomeHeader";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { RecentRecordCard } from "@/components/home/RecentRecordCard";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeScreen() {
  // Uma única chamada (GET /alunos/:userId/home) traz totais e registros recentes
  const { data: home, isLoading: loading, error } = useSWR("home", getAlunoHome);
  // Mesma chave do perfil: o nome fica em cache compartilhado entre as telas
  const { data: perfilResp } = useSWR("perfil", () => getProfile());
  const perfil = (perfilResp as any)?.data ?? perfilResp;
  const primeiroNome = perfil?.name?.trim().split(/\s+/)[0];

  const resumo: AlunoResumo = {
    total_formularios: home?.total_formularios ?? 0,
    total_semanas: home?.total_semanas ?? 0,
    total_relatorios: home?.total_relatorios ?? 0,
  };

  // A API já devolve os formulários ordenados do mais recente para o mais antigo
  const registrosRecentes = (home?.formularios_recentes ?? []).slice(0, 2);

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <HomeHeader resumo={resumo} nomeUsuario={primeiroNome} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-32 pt-6 md:px-20"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <Text className="text-2xl font-bold text-slate-950">Ações rápidas</Text>
        </View>

        <View className="mb-8 flex-row flex-wrap justify-between gap-3">
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
            title="Resumo" // Palavra alterada conforme solicitado
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

        <View className="lg:flex-row gap-2 lg:flex-wrap">
          {loading ? (
            <View className="gap-3">
              {[0, 1].map((i) => (
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
          ) : error ? (
            <View className="items-center rounded-2xl bg-white p-8">
              <Text className="text-base font-semibold text-slate-500">
                Não foi possível carregar seus registros
              </Text>
              <Text className="mt-1 text-sm text-slate-400">
                Verifique sua conexão e tente novamente
              </Text>
            </View>
          ) : registrosRecentes.length === 0 ? (
            <View className="items-center rounded-2xl bg-white p-8">
              <Text className="text-base font-semibold text-slate-500">
                Não há relatórios
              </Text>
              <Text className="mt-1 text-sm text-slate-400">
                Crie seu primeiro registro
              </Text>
            </View>
          ) : (
            registrosRecentes.map((item) => (
              <RecentRecordCard key={item.id} item={item} />
            ))
          )}
        </View>
      </ScrollView>

    </View>
  );
}