import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import useSWR, { mutate } from "swr";

import { getPlantas, type SemesterFocus } from "@/database/plantasForrageiras";
import { getMinhasTurmas } from "@/database/turmas";
import { createCanteiro, updateCanteiro } from "@/database/canteiros";
import { extractApiError } from "@/lib/apiError";
import { isLikelyOnline, markOffline } from "@/database/offlineSync";

import HeaderStack from "@/components/navigation/headerStack";
import Warning from "@/components/forms/warning";
import { PlantSelect } from "@/components/nova-lista/PlantSelect";
import { AnalysisTypeCard } from "@/components/nova-lista/AnalysisTypeCard";
import { LabeledField } from "@/components/nova-lista/LabeledField";
import { TurmaSelect } from "@/components/nova-lista/TurmaSelect";
import { Check } from "lucide-react-native";
import { AppIcon, getPlantCategoryIcon, type AppIconName } from "@/components/ui/AppIcon";

type PlantOption = {
  id: string;
  name: string;
  icon: AppIconName;
};

function mapPlanta(planta: any): PlantOption {
  return {
    id: String(planta.id),
    name: planta.name ?? "Planta",
    icon: getPlantCategoryIcon(planta.category),
  };
}

type AnalysisType = {
  id: string;
  title: string;
  icon: AppIconName;
  // Filtra o catálogo de plantas (plantas com foco AMBOS aparecem nos dois)
  semesterFocus: SemesterFocus;
};

const ANALYSIS_TYPES: AnalysisType[] = [
  {
    id: "1-semestre",
    title: "Cultivar, manejar e caracterizar",
    icon: "plant",
    semesterFocus: "PRIMEIRO",
  },
  {
    id: "2-semestre",
    title: "Fatores ecológicos",
    icon: "globe",
    semesterFocus: "SEGUNDO",
  },
];

// Sem parâmetros cria um canteiro; com `id` edita o canteiro existente
export default function NovaListaScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    plant_id?: string;
    tem_formularios?: string;
  }>();
  const editing = !!params.id;
  // Com formulários registrados, a planta não pode mais ser trocada
  const plantaTravada = editing && params.tem_formularios === "1";

  const [selectedPlantId, setPlantId] = useState<string>(params.plant_id ?? "");
  const [analysisTypeId, setAnalysisTypeId] = useState<string>(
    ANALYSIS_TYPES[0].id
  );
  const [nomeCanteiro, setNomeCanteiro] = useState<string>(params.name ?? "");
  const [saving, setSaving] = useState(false);
  // Vínculo com a universidade: só aparece se o aluno marcar
  const [usarUniversidade, setUsarUniversidade] = useState(false);
  const [turmaId, setTurmaId] = useState<string | null>(null);

  const semesterFocus = ANALYSIS_TYPES.find(
    (type) => type.id === analysisTypeId
  )?.semesterFocus;

  // Catálogo de plantas filtrado pelo tipo de análise (semestre)
  const {
    data: plantasData,
    isLoading: loadingPlantas,
    error: plantasError,
  } = useSWR(["plantas", editing ? "todas" : semesterFocus], () =>
    // Ao editar, o catálogo vem inteiro para incluir a planta atual
    getPlantas(undefined, editing ? undefined : semesterFocus)
  );
  const plantas: PlantOption[] = (
    Array.isArray(plantasData) ? plantasData : (plantasData?.data ?? [])
  ).map(mapPlanta);

  // Turmas do aluno: o período letivo é o da turma escolhida
  const { data: turmasData } = useSWR("minhas-turmas", getMinhasTurmas);
  const turmas = turmasData ?? [];
  const temTurma = turmas.length > 0;
  const turmaEscolhida = turmas.find((item) => item.id === turmaId);
  const periodoLetivo: string = turmaEscolhida?.period?.name ?? "";

  // Ao trocar de semestre a lista muda: se a planta escolhida saiu do
  // catálogo, vale a primeira da nova lista
  const plantId = plantas.some((plant) => plant.id === selectedPlantId)
    ? selectedPlantId
    : (plantas[0]?.id ?? "");

  async function handleSalvar() {
    if (!plantId) {
      Alert.alert("Selecione uma planta", "Escolha a planta do canteiro.");
      return;
    }
    if (!nomeCanteiro.trim()) {
      Alert.alert("Nome obrigatório", "Informe o nome do canteiro.");
      return;
    }

    if (!editing && usarUniversidade && temTurma && !turmaId) {
      Alert.alert("Selecione a turma", "Escolha a turma ou desmarque a opção da universidade.");
      return;
    }

    try {
      setSaving(true);

      if (editing) {
          if (!isLikelyOnline()) {
            Alert.alert(
              "Sem conexão",
              "A edição do canteiro só pode ser feita quando a conexão com a internet for restabelecida."
            );
            return;
          }
        // Só envia o que mudou
        const mudancas: { name?: string; plant_id?: string } = {};
        if (nomeCanteiro.trim() !== (params.name ?? "")) mudancas.name = nomeCanteiro.trim();
        if (!plantaTravada && plantId !== params.plant_id) mudancas.plant_id = plantId;

          try {
            if (Object.keys(mudancas).length > 0) {
              await updateCanteiro(params.id as string, mudancas);
            }
          } catch (error) {
            const e = error as { response?: unknown; code?: string; message?: string };
            if (!e?.response && (e?.code === "ERR_NETWORK" || /network/i.test(e?.message ?? ""))) {
              markOffline();
              Alert.alert(
                "Sem conexão",
                "A edição do canteiro só pode ser feita quando a conexão com a internet for restabelecida."
              );
              return;
            }
            throw error;
        }
      } else {
        // Uma chamada só: o backend cria canteiro, vínculo com o usuário do
        // token e lista de formulários numa transação
        const result: any = await createCanteiro({
          plant_id: plantId,
          name: nomeCanteiro.trim(),
          ...(usarUniversidade && turmaId ? { turma_id: turmaId } : {}),
        });

        if (result?.queuedOffline) {
          Alert.alert(
            "Salvo offline",
            "O canteiro será enviado quando a conexão com a internet for restabelecida."
          );
          router.back();
          return;
        }
      }

      // Revalida canteiros, home e relatórios (que mostram nome e planta)
      await Promise.all([
        mutate("user-canteiros"),
        mutate("home"),
        mutate("relatorios"),
      ]);

      Alert.alert("Pronto!", editing ? "Canteiro atualizado." : "Canteiro criado com sucesso.");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar canteiro:", error);
      Alert.alert(
        "Erro ao salvar",
        extractApiError(
          error,
          editing
            ? "Não foi possível atualizar o canteiro agora."
            : "Não foi possível criar o canteiro agora."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <HeaderStack title={editing ? "Editar canteiro" : "Novo canteiro"} />

        {/* Escolha a planta */}
        <Text className="mb-3 text-lg font-bold text-slate-900">
          Escolha a planta
        </Text>

        {plantaTravada ? (
          <Warning text="A planta não pode ser trocada porque este canteiro já tem formulários. Você pode alterar o nome." />
        ) : null}

        <PlantSelect
          items={plantas}
          value={plantId || null}
          onChange={setPlantId}
          loading={loadingPlantas}
          error={plantasError ? "Não foi possível carregar as plantas." : undefined}
          disabled={plantaTravada}
          emptyText={
            editing ? "Nenhuma planta disponível." : "Nenhuma planta disponível para este semestre."
          }
        />

        {/* Tipo de análise (só ao criar: filtra as plantas por semestre) */}
        {editing ? null : (
          <>
            <Text className="mb-3 text-lg font-bold text-slate-900">
              Tipo de análise
            </Text>

            <View className="mb-6 flex-row gap-3">
              {ANALYSIS_TYPES.map((type) => (
                <AnalysisTypeCard
                  key={type.id}
                  title={type.title}
                      icon={type.icon}
                  selected={type.id === analysisTypeId}
                  onPress={() => setAnalysisTypeId(type.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* Configurações */}
        <View className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="mr-2">
              <AppIcon name="gear" size={18} color="#065f46" />
            </View>
            <Text className="text-sm font-extrabold uppercase tracking-wide text-emerald-900">
              Configurações
            </Text>
          </View>

          <LabeledField label="Nome do canteiro">
            <TextInput
              value={nomeCanteiro}
              onChangeText={setNomeCanteiro}
              placeholder="Ex: Canteiro A — Bloco 3"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
            />
          </LabeledField>
        </View>

        {/* Universidade (opcional, só ao criar) */}
        {editing ? null : (
          <View className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: usarUniversidade }}
              onPress={() => setUsarUniversidade((atual) => !atual)}
              className="flex-row items-center active:opacity-80"
            >
              <View
                className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${
                  usarUniversidade
                    ? "border-emerald-800 bg-emerald-800"
                    : "border-slate-300 bg-white"
                }`}
              >
                {usarUniversidade ? <Check size={16} color="#ffffff" /> : null}
              </View>
              <Text className="flex-1 text-base text-slate-700">
                Este canteiro é de uma turma da universidade
              </Text>
            </Pressable>

            {usarUniversidade ? (
              <View key="universidade" className="mt-4">
                {temTurma ? null : (
                  <Text className="mb-3 text-sm leading-5 text-slate-400">
                    Você ainda não está em nenhuma turma. Entre com o código da professora em
                    Perfil › Minhas turmas.
                  </Text>
                )}

                <LabeledField label="Turma">
                  <TurmaSelect
                    turmas={turmas}
                    value={turmaId}
                    onChange={setTurmaId}
                    disabled={!temTurma}
                    placeholder={temTurma ? "Selecione a turma" : "Sem turma"}
                  />
                </LabeledField>

                <LabeledField label="Período letivo">
                  <View
                    className={`rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 ${
                      temTurma ? "" : "opacity-50"
                    }`}
                  >
                    <Text
                      className={`text-base ${periodoLetivo ? "text-slate-700" : "text-slate-400"}`}
                    >
                      {periodoLetivo || "Definido pela turma"}
                    </Text>
                  </View>
                </LabeledField>
              </View>
            ) : null}
          </View>
        )}

        <Warning text="Use EPIs adequados. Leve protetor solar e água." />
      </ScrollView>

      {/* Footer fixo com a ação principal */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-slate-50 px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        <Pressable
          onPress={handleSalvar}
          disabled={saving}
          className="h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">
              {editing ? "Salvar alterações" : "Criar canteiro"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
