import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import { CanteiroCard } from "@/components/canteiros/CanteiroCard";

// ---------------------------------------------------------------------------
// DADOS MOCKADOS — substituir por getCanteirosByUser(userId) (services/api.ts,
// já existe). Mapear o retorno (CanteiroResumo) para os campos abaixo:
//   name           -> plant?.name
//   description    -> plant?.category
//   totalRegistros -> listaDeFormularios?.[0]?._count?.formularios
//   lastRecord / status / progress -> derivar no back-end ou calcular a partir
//   dos formulários (não vêm prontos em CanteiroResumo hoje).
// ---------------------------------------------------------------------------
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

const MOCK_CANTEIROS: CanteiroItem[] = [
  {
    id: "canteiro-1",
    icon: "🌱",
    name: "Capim Massai",
    description: "Gramínea porte alto",
    totalRegistros: 12,
    lastRecord: "07 Abr",
    status: "ATIVO",
    progress: 80,
  },
  {
    id: "canteiro-2",
    icon: "🌿",
    name: "Braquiária Ruziziensis",
    description: "Brachiaria",
    totalRegistros: 8,
    lastRecord: "05 Abr",
    status: "ATIVO",
    progress: 55,
  },
  {
    id: "canteiro-3",
    icon: "🍀",
    name: "Estilosantes",
    description: "Leguminosa herbácea",
    totalRegistros: 5,
    lastRecord: "01 Abr",
    status: "PAUSADO",
    progress: 35,
  },
];

export default function CanteirosScreen() {
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

        {MOCK_CANTEIROS.map((canteiro) => (
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
        ))}

        <Pressable
          onPress={() => router.push("/nova-lista")}
          className="mt-1 items-center rounded-2xl border-2 border-dashed border-emerald-300 bg-white py-4 active:opacity-80"
        >
          <Text className="text-base font-bold text-emerald-800">
            ＋ Adicionar nova planta
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
