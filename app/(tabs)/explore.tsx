import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import useSWR, { mutate } from "swr";
import { deleteCanteiro, getCanteirosByUser } from "@/database/canteiros";
import { extractApiError } from "@/lib/apiError";
import { getProfile } from "@/database/user";
import { CanteiroCard } from "@/components/canteiros/CanteiroCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getPlantCategoryIcon,
  type AppIconName,
} from "@/components/ui/AppIcon";

type CanteiroItem = {
  id: string;
  icon: AppIconName;
  name: string;
  description: string;
  plantId: string;
  totalRegistros: number;
  lastRecord: string;
  status: "ATIVO" | "PAUSADO";
  progress: number;
};

const SEMANAS_ACOMPANHAMENTO = 12;
const DIAS_PARA_PAUSAR = 14;

const mapCanteiroToCanteiro = (canteiro: any): CanteiroItem => {
  const listas: any[] = canteiro.listaDeFormularios ?? [];

  // Soma os registros de todas as listas do canteiro
  const totalRegistros = listas.reduce(
    (sum, lista) => sum + (lista._count?.formularios ?? 0),
    0
  );

  // Data do registro mais recente entre todas as listas
  const datas = listas
    .map((lista) => lista.formularios?.[0]?.date)
    .filter(Boolean)
    .map((raw: string) => new Date(raw))
    .filter((d: Date) => !Number.isNaN(d.getTime()));
  const ultimo = datas.length
    ? new Date(Math.max(...datas.map((d: Date) => d.getTime())))
    : null;
  const lastRecord = ultimo
    ? ultimo.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : '—';

  // O acompanhamento tem até 12 semanas (limite de "week" no backend):
  // progresso = registros semanais feitos / 12
  const progress = Math.min(100, (totalRegistros / SEMANAS_ACOMPANHAMENTO) * 100);

  // Registro semanal: sem registro há mais de 14 dias (duas semanas) = pausado.
  // Canteiro novo, ainda sem nenhum registro, conta como ativo.
  const diasSemRegistro = ultimo
    ? (Date.now() - ultimo.getTime()) / 86400000
    : 0;
  const status: CanteiroItem['status'] =
    diasSemRegistro > DIAS_PARA_PAUSAR ? 'PAUSADO' : 'ATIVO';

  return {
    id: canteiro.id,
    icon: getPlantCategoryIcon(canteiro.plant?.category),
    name: canteiro.name || canteiro.plant?.name || 'Canteiro',
    description: canteiro.plant?.name || 'Planta',
    plantId: String(canteiro.plant?.id ?? canteiro.plant_id ?? ''),
    totalRegistros,
    lastRecord,
    status,
    progress: Math.round(progress),
  };
};

export default function CanteirosScreen() {
  const insets = useSafeAreaInsets();
  const { data: canteiros, error, isLoading } = useSWR('user-canteiros', getCanteirosByUser);
  // Período letivo do cabeçalho vem do perfil do aluno
  const { data: perfilResp } = useSWR('perfil', () => getProfile());
  const perfil = (perfilResp as any)?.data ?? perfilResp;

  const lista = Array.isArray(canteiros) ? canteiros : (canteiros?.data ?? []);
  const mappedCanteiros: CanteiroItem[] = lista.map(mapCanteiroToCanteiro);

  // Segurar o card abre as ações do canteiro
  function handleAcoes(canteiro: CanteiroItem) {
    Alert.alert(canteiro.name, "O que você quer fazer com este canteiro?", [
      {
        text: "Editar",
        onPress: () =>
          router.push({
            pathname: "/nova-lista",
            params: {
              id: canteiro.id,
              name: canteiro.name,
              plant_id: canteiro.plantId,
              // A planta só pode ser trocada enquanto não houver formulários
              tem_formularios: canteiro.totalRegistros > 0 ? "1" : "0",
            },
          }),
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => handleExcluir(canteiro),
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  // Pede confirmação e exclui o canteiro
  function handleExcluir(canteiro: CanteiroItem) {
    Alert.alert(
      `Excluir "${canteiro.name}"?`,
      "Os registros e as fotos deste canteiro serão apagados e isso não pode ser desfeito. Se outros alunos também usam o canteiro, ele só sai da sua lista.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCanteiro(canteiro.id);
              // Atualiza canteiros, home e a lista de relatórios
              await Promise.all([
                mutate("user-canteiros"),
                mutate("home"),
                mutate("relatorios"),
              ]);
            } catch (err) {
              Alert.alert(
                "Não foi possível excluir",
                extractApiError(err, "Tente novamente em instantes.")
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        contentContainerStyle={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-end justify-between">
          <Text className="text-2xl font-bold text-emerald-900">
            Meu Canteiro
          </Text>
          <Text className="text-sm font-semibold text-slate-400">
            {perfil?.academic_period?.name ?? ''}
          </Text>
        </View>

        {isLoading ? (
          <View className="gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width="100%" height={120} radius={16} />
            ))}
          </View>
        ) : error ? (
          <View className="justify-center items-center py-12">
            <Text className="text-red-600 text-center">Erro ao carregar canteiros</Text>
          </View>
        ) : mappedCanteiros.length === 0 ? (
          <View className="justify-center items-center py-12">
            <Text className="text-slate-400 text-center mb-6">Nenhum canteiro cadastrado</Text>
          </View>
        ) : (
          mappedCanteiros.map((canteiro) => (
            <CanteiroCard
              key={canteiro.id}
              icon={canteiro.icon}
              name={canteiro.name}
              description={canteiro.description}
              totalRegistros={canteiro.totalRegistros}
              lastRecord={canteiro.lastRecord}
              status={canteiro.status}
              progress={canteiro.progress}
              onLongPress={() => handleAcoes(canteiro)}
              onPress={() =>
                router.push({
                  pathname: "/canteiros/[id]",
                  params: { id: canteiro.id, name: canteiro.name },
                })
              }
            />
          ))
        )}

        <Pressable
          onPress={() => router.push("/nova-lista")}
          className="mt-4 items-center rounded-2xl border-2 border-dashed border-emerald-300 bg-white py-4 active:opacity-80"
        >
          <Text className="text-base font-bold text-emerald-800">
            ＋ Adicionar nova planta
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
