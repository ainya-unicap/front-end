import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import {
  FormularioResumo,
  getAlunoResumo,
  getFormulariosByUser,
  type AlunoResumo,
} from "@/services/api";

import { HomeHeader } from "@/components/home/HomeHeader";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { RecentRecordCard } from "@/components/home/RecentRecordCard";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";

const MOCK_USER_ID = "ID_DO_USUARIO";

const mockResumo: AlunoResumo = {
  total_formularios: 12,
  total_semanas: 12,
  total_relatorios: 1,
};

const mockFormularios: FormularioResumo[] = [
  {
    id: "mock-1",
    type: "SEMANAL",
    synced: true,
    createdAt: "2026-04-07T10:00:00.000Z",
    list: {
      id: "lista-1",
      plant: {
        id: "plant-1",
        name: "Capim Massai",
      },
    },
  },
  {
    id: "mock-2",
    type: "SEMANAL",
    synced: false,
    createdAt: "2026-03-31T10:00:00.000Z",
    list: {
      id: "lista-2",
      plant: {
        id: "plant-1",
        name: "Capim Massai",
      },
    },
  },
  {
    id: "mock-3",
    type: "SEMANAL",
    synced: true,
    createdAt: "2026-03-24T10:00:00.000Z",
    list: {
      id: "lista-3",
      plant: {
        id: "plant-1",
        name: "Capim Massai",
      },
    },
  },
];

export default function HomeScreen() {
  const [resumo, setResumo] = useState<AlunoResumo>(mockResumo);
  const [formularios, setFormularios] =
    useState<FormularioResumo[]>(mockFormularios);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(true);

  const registrosRecentes = useMemo(
    () => formularios.slice(0, 3),
    [formularios]
  );

  useEffect(() => {
    async function loadHome() {
      try {
        setLoading(true);

        const [resumoResponse, formulariosResponse] = await Promise.all([
          getAlunoResumo(MOCK_USER_ID),
          getFormulariosByUser(MOCK_USER_ID),
        ]);

        setResumo(resumoResponse.data);
        setFormularios(formulariosResponse.data);
        setUsingMock(false);
      } catch (error) {
        console.log("Usando dados mockados na Home:", error);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, []);

  return (
    <View className="flex-1 bg-slate-50">
      <HomeHeader resumo={resumo} usingMock={usingMock} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-32 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-slate-950">
            Ações rápidas
          </Text>

          {loading && <ActivityIndicator />}
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
          />

          <QuickActionCard icon="📊" title="Histórico" subtitle="Evolução" />
        </View>

        <Text className="mb-3 text-2xl font-bold text-slate-950">
          Registros recentes
        </Text>

        {registrosRecentes.map((item) => (
          <RecentRecordCard key={item.id} item={item} />
        ))}
      </ScrollView>

      <BottomNavbar active="home" />
    </View>
  );
}