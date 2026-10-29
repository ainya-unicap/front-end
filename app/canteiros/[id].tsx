import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import useSWR from "swr";

import { getCanteiroFormularios } from "@/database/canteiros";

import { StatusBadge } from "@/components/canteiros/StatusBadge";
import { FormularioCard } from "@/components/canteiros/FormularioCard";

type FormularioItem = {
  id: string;
  week: number;
  complete: boolean;
  dateLabel: string;
  photos: number;
};

function formatDateLabel(formulario: any): string {
  const raw = formulario.date ?? formulario.createdAt;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapFormulario(formulario: any): FormularioItem {
  return {
    id: String(formulario.id),
    week: formulario.week ?? 0,
    // synced = true quando o registro terminou de ser salvo (dados e fotos)
    complete: formulario.synced === true,
    dateLabel: formatDateLabel(formulario),
    photos: formulario.photos?.length ?? 0,
  };
}

// GET /canteiros/:id/formularios devolve as listas do canteiro, cada uma com
// seus registros e fotos. A lista mais recente é a que recebe novos registros.
async function fetchFormularios(canteiroId: string) {
  const resp = await getCanteiroFormularios(canteiroId);
  const listas: any[] = Array.isArray(resp) ? resp : (resp?.data ?? []);

  return {
    listId: listas[0]?.id ? String(listas[0].id) : null,
    items: listas
      .flatMap((lista) => lista.formularios ?? [])
      .map(mapFormulario),
  };
}

export default function ListaFormulariosScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const canteiroName = name || "Canteiro";

  const { data, isLoading } = useSWR(id ? `canteiro-forms-${id}` : null, () =>
    fetchFormularios(id)
  );

  const formularios: FormularioItem[] = data?.items ?? [];
  const listId: string | null = data?.listId ?? null;

  function handleNovoRegistro() {
    // Abre a tela de criação de registro já com o list_id da lista do canteiro.
    router.push({ pathname: "/registro", params: { list_id: listId ?? "" } });
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Cabeçalho */}
      <View className="flex-row items-center justify-between px-5 pb-4 pt-14">
        <View className="flex-1 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:opacity-80"
          >
            <AntDesign name="left" size={16} color="#1f2937" />
          </Pressable>

          <Text
            className="ml-3 flex-1 text-2xl font-bold text-slate-900"
            numberOfLines={1}
          >
            {canteiroName}
          </Text>
        </View>

        <StatusBadge label={`${formularios.length} REG.`} variant="green" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color="#065f46" className="mt-10" />
        ) : formularios.length === 0 ? (
          <Text className="mt-10 text-center text-sm text-slate-400">
            Nenhum registro neste canteiro ainda.
          </Text>
        ) : (
          formularios.map((item) => (
            <FormularioCard
              key={item.id}
              week={item.week}
              complete={item.complete}
              dateLabel={item.dateLabel}
              photos={item.photos}
              onPress={() => router.push(`/registro-salvo/${item.id}`)}
            />
          ))
        )}
      </ScrollView>

      {/* Botão flutuante: novo registro semanal */}
      <View className="absolute bottom-8 left-0 right-0 items-center">
        <Pressable
          onPress={handleNovoRegistro}
          className="h-16 w-16 items-center justify-center rounded-full bg-emerald-800 shadow-lg active:opacity-80"
        >
          <AntDesign name="plus" size={28} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
