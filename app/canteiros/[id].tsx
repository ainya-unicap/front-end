import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

import { StatusBadge } from "@/components/canteiros/StatusBadge";
import { FilterChips } from "@/components/canteiros/FilterChips";
import { FormularioCard } from "@/components/canteiros/FormularioCard";

// ---------------------------------------------------------------------------
// DADOS MOCKADOS — substituir por getFormulariosByUser/list (services/api.ts).
// Para uma lista específica o ideal é um getFormulariosByLista(listId). Mapear
// cada FormularioResumo/Completo para os campos abaixo:
//   week           -> nº da semana (derivar de createdAt/started_at)
//   status         -> COMPLETO/RASCUNHO/PENDENTE (campo de status no back-end)
//   dateLabel      -> formatar started_at/ended_at
//   photos         -> photos?.length
//   checklistDone  -> checklists?.filter(c => c.checked).length
//   checklistTotal -> checklists?.length
//   progress       -> % de preenchimento (derivar)
// ---------------------------------------------------------------------------
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

const MOCK_FORMULARIOS: FormularioItem[] = [
  {
    id: "form-12",
    week: 12,
    status: "COMPLETO",
    dateLabel: "07 Abr 2026 · 08:00—10:30",
    photos: 3,
    checklistDone: 3,
    checklistTotal: 5,
    progress: 100,
  },
  {
    id: "form-11",
    week: 11,
    status: "RASCUNHO",
    dateLabel: "31 Mar 2026 · 08:15—09:45",
    photos: 2,
    checklistDone: 2,
    checklistTotal: 5,
    progress: 65,
  },
  {
    id: "form-10",
    week: 10,
    status: "COMPLETO",
    dateLabel: "24 Mar 2026",
    photos: 4,
    checklistDone: 5,
    checklistTotal: 5,
    progress: 100,
  },
  {
    id: "form-9",
    week: 9,
    status: "COMPLETO",
    dateLabel: "17 Mar 2026",
    photos: 3,
    checklistDone: 5,
    checklistTotal: 5,
    progress: 100,
  },
  {
    id: "form-8",
    week: 8,
    status: "PENDENTE",
    dateLabel: "10 Mar 2026",
    photos: 0,
    checklistDone: 0,
    checklistTotal: 5,
    progress: 0,
  },
];

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

  const formularios = useMemo(() => {
    const status = FILTER_STATUS[filter];

    if (!status) {
      return MOCK_FORMULARIOS;
    }

    return MOCK_FORMULARIOS.filter((item) => item.status === status);
  }, [filter]);

  function handleNovoRegistro() {
    // Abre a tela de criação de registro já com o list_id deste canteiro.
    router.push({ pathname: "/registro", params: { list_id: id } });
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

        <StatusBadge label={`${MOCK_FORMULARIOS.length} REG.`} variant="green" />
      </View>

      <View className="px-5">
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {formularios.length === 0 ? (
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
