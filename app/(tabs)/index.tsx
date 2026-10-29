import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import useSWR from "swr";
import { StatusBar } from "expo-status-bar";

import { getAlunoHome } from "@/database/alunos";
import { getCanteirosByUser } from "@/database/canteiros";
import { getProfile } from "@/database/user";
import { type AlunoResumo } from "@/services/api";

import {
  CanteiroPickerModal,
  type CanteiroOption,
} from "@/components/home/CanteiroPickerModal";
import { HomeHeader } from "@/components/home/HomeHeader";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { RecentRecordCard } from "@/components/home/RecentRecordCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { getPlantCategoryIcon } from "@/components/ui/AppIcon";

type Picker = "registro" | "relatorio" | null;

export default function HomeScreen() {
  // Uma única chamada (GET /alunos/:userId/home) traz totais e registros recentes
  const { data: home, isLoading: loading, error } = useSWR("home", getAlunoHome);

  // Canteiros do aluno para os popups (mesma chave da aba Canteiros)
  const { data: canteirosData, isLoading: loadingCanteiros } = useSWR(
    "user-canteiros",
    getCanteirosByUser
  );
  const canteiros: CanteiroOption[] = useMemo(() => {
    const arr: any[] = Array.isArray(canteirosData)
      ? canteirosData
      : (canteirosData?.data ?? []);

    return arr.map((canteiro) => ({
      id: String(canteiro.id),
      name: canteiro.name ?? canteiro.plant?.name ?? "Canteiro",
      plantName: canteiro.plant?.name ?? "Planta",
      icon: getPlantCategoryIcon(canteiro.plant?.category),
      // Se houver mais de uma lista, vale a primeira (igual à aba Canteiros)
      listId: canteiro.listaDeFormularios?.[0]?.id
        ? String(canteiro.listaDeFormularios[0].id)
        : null,
    }));
  }, [canteirosData]);

  const [picker, setPicker] = useState<Picker>(null);

  function handleSelecionarCanteiro(canteiro: CanteiroOption) {
    const destino = picker;
    setPicker(null);

    if (destino === "registro") {
      router.push({ pathname: "/registro", params: { list_id: canteiro.listId ?? "" } });
    } else if (destino === "relatorio") {
      router.push({ pathname: "/relatorios/novo", params: { canteiro_id: canteiro.id } });
    }
  }

  function handleCriarCanteiro() {
    setPicker(null);
    router.push("/nova-lista");
  }

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
            fullWidth
            icon="note"
            title="Novo Registro"
            subtitle="Registro semanal"
            onPress={() => setPicker("registro")}
          />

          <QuickActionCard
            icon="plant"
            title="Novo Canteiro"
            subtitle="Cadastrar planta"
            onPress={() => router.push("/nova-lista")}
          />

          <QuickActionCard
            icon="file"
            title="Novo Relatório"
            subtitle="Gerar com IA"
            onPress={() => setPicker("relatorio")}
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

      <CanteiroPickerModal
        visible={picker !== null}
        title={
          picker === "relatorio"
            ? "Relatório de qual canteiro?"
            : "Registro de qual canteiro?"
        }
        subtitle="Escolha o canteiro para continuar."
        canteiros={canteiros}
        loading={loadingCanteiros}
        requireList={picker === "registro"}
        onClose={() => setPicker(null)}
        onSelect={handleSelecionarCanteiro}
        onCreateCanteiro={handleCriarCanteiro}
      />
    </View>
  );
}