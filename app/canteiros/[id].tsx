import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import useSWR from "swr";

import { getCanteiroListas } from "@/database/canteiros";
import { getListaFormularios } from "@/database/listasFormularios";

import { StatusBadge } from "@/components/canteiros/StatusBadge";
import { FilterChips } from "@/components/canteiros/FilterChips";
import { FormularioCard } from "@/components/canteiros/FormularioCard";

type FormularioItem = {
  id: string;
  week: number;
  status: "COMPLETO" | "RASCUNHO" | "PENDENTE";
  dateLabel: string;
  photos: number;
  checklistDone: number;
  checklistTotal: number;
  progress: number;
};

function formatDateLabel(formulario: any): string {
  const raw =
    formulario.data_preenchimento ??
    formulario.createdAt ??
    formulario.started_at;
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
  const checklists = formulario.checklists ?? [];
  const checklistTotal = checklists.length ?? 0;
  const checklistDone = checklists.filter((c: any) => c.checked).length ?? 0;
  const photos = formulario.photos?.length ?? formulario._count?.photos ?? 0;

  const status: FormularioItem["status"] =
    (formulario.status as FormularioItem["status"]) ??
    (formulario.synced ? "COMPLETO" : "RASCUNHO");

  const progress =
    checklistTotal > 0
      ? Math.round((checklistDone / checklistTotal) * 100)
      : status === "COMPLETO"
        ? 100
        : 0;

  return {
    id: String(formulario.id),
    week: formulario.semana ?? formulario.week ?? 0,
    status,
    dateLabel: formatDateLabel(formulario),
    photos,
    checklistDone,
    checklistTotal,
    progress,
  };
}

// Busca a primeira lista do canteiro e seus formulários
async function fetchFormularios(canteiroId: string) {
  const listasResp = await getCanteiroListas(canteiroId);
  const listas = Array.isArray(listasResp)
    ? listasResp
    : (listasResp?.data ?? []);
  const lista = listas[0];
  if (!lista?.id) {
    return { listId: null as string | null, items: [] as FormularioItem[] };
  }
  const formulariosResp = await getListaFormularios(lista.id);
  const formularios = Array.isArray(formulariosResp)
    ? formulariosResp
    : (formulariosResp?.data ?? []);
  return {
    listId: String(lista.id),
    items: formularios.map(mapFormulario),
  };
}

const FILTERS = ["Todos", "Completos", "Rascunhos", "Pendentes"];

const FILTER_STATUS: Record<string, FormularioItem["status"]> = {
  Completos: "COMPLETO",
  Rascunhos: "RASCUNHO",
  Pendentes: "PENDENTE",
};

export default function ListaFormulariosScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const canteiroName = name || "Canteiro";

  const [filter, setFilter] = useState("Todos");

  const { data, isLoading } = useSWR(id ? `canteiro-forms-${id}` : null, () =>
    fetchFormularios(id)
  );

  const todos: FormularioItem[] = data?.items ?? [];
  const listId: string | null = data?.listId ?? null;

  const formularios = useMemo(() => {
    const status = FILTER_STATUS[filter];
    if (!status) return todos;
    return todos.filter((item) => item.status === status);
  }, [filter, todos]);

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

        <StatusBadge label={`${todos.length} REG.`} variant="green" />
      </View>

      <View className="px-5">
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
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
            Nenhum registro nesta categoria.
          </Text>
        ) : (
          formularios.map((item) => (
            <FormularioCard
              key={item.id}
              week={item.week}
              status={item.status}
              dateLabel={item.dateLabel}
              photos={item.photos}
              checklistDone={item.checklistDone}
              checklistTotal={item.checklistTotal}
              progress={item.progress}
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
