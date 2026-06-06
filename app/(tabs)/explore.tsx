import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import useSWR from "swr";
import { getCanteirosByUser } from "@/database/canteiros";
import { CanteiroCard } from "@/components/canteiros/CanteiroCard";
import { Skeleton } from "@/components/ui/Skeleton";

type CanteiroItem = {
  id: string;
  icon: string;
  name: string;
  description: string;
  totalRegistros: number;
  lastRecord: string;
  status: "ATIVO" | "PAUSADO";
  progress: number;
};

const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'CACTACEA': '🌵',
    'CULTURA_ANUAL': '🌾',
    'GRAMINEA_PORTE_ALTO': '🌱',
    'GRAMINEA_PORTE_BAIXO': '🍀',
    'GRAMINEA_PORTE_MEDIO': '🌿',
    'LEGUMINOSA_ARBUSTIVA': '🌳',
    'LEGUMINOSA_HERBACEA': '🍃',
    'OLEAGINOSA_FORRAGEIRA': '🌻',
  };
  return iconMap[category] || '🌱';
};

const mapCanteiroToCanteiro = (canteiro: any): CanteiroItem => {
  const totalRegistros = canteiro.listaDeFormularios?.[0]?._count?.formularios ?? 0;
  const lastFormulario = canteiro.listaDeFormularios?.[0]?.formularios?.[0];
  
  const lastRecord = lastFormulario?.createdAt 
    ? new Date(lastFormulario.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : '—';
  
  const progress = totalRegistros > 0 ? Math.min(100, (totalRegistros / 20) * 100) : 0;
  
  return {
    id: canteiro.id,
    icon: getCategoryIcon(canteiro.plant?.category),
    name: canteiro.plant?.name || 'Canteiro',
    description: canteiro.plant?.category || 'Planta',
    totalRegistros,
    lastRecord,
    status: canteiro.status || 'ATIVO',
    progress: Math.round(progress),
  };
};

export default function CanteirosScreen() {
  const { data: canteiros, error, isLoading } = useSWR('user-canteiros', getCanteirosByUser);

  const lista = Array.isArray(canteiros) ? canteiros : (canteiros?.data ?? []);
  const mappedCanteiros: CanteiroItem[] = lista.map(mapCanteiroToCanteiro);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32 pt-14"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-end justify-between">
          <Text className="text-2xl font-bold text-emerald-900">
            Meu Canteiro
          </Text>
          <Text className="text-sm font-semibold text-slate-400">2026.1</Text>
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
