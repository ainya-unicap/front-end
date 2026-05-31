import { useEffect, useMemo, useState } from "react";
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
import useSWR from "swr";

import {
  createChecklistItems,
  createFormulario,
  createMeasurements,
  finalizarFormulario,
} from "@/database/formularios";
import { getListaById } from "@/database/listasFormularios";
import { getPlantTemplates } from "@/database/plantTemplates";

import { FieldBox } from "@/components/registro/FieldBox";
import { SectionCard } from "@/components/registro/SectionCard";
import { ChecklistItem } from "@/components/registro/ChecklistItem";
import { PhotoUploadBox } from "@/components/registro/PhotoUploadBox";
import { Skeleton } from "@/components/ui/Skeleton";

type Measurement = {
  template_id: string;
  field_name: string;
  unit: string;
  value: string;
};

type ChecklistEntry = {
  template_id: string;
  label: string;
  checked: boolean;
};

function hoje() {
  return new Date().toLocaleDateString("pt-BR");
}

export default function RegistroScreen() {
  // list_id vem da tela de lista de formulários do canteiro.
  const { list_id } = useLocalSearchParams<{ list_id?: string }>();

  // Lista -> canteiro -> planta, para buscar os campos (templates) corretos.
  const { data: lista } = useSWR(list_id ? `lista-${list_id}` : null, () =>
    getListaById(list_id as string)
  );

  const listaObj = (lista as any)?.data ?? lista;
  const plantId =
    listaObj?.canteiro?.plant_id ??
    listaObj?.canteiro?.plant?.id ??
    listaObj?.plant_id ??
    listaObj?.plant?.id;

  const { data: templates, isLoading: loadingTemplates } = useSWR(
    plantId ? `plant-templates-${plantId}` : null,
    () => getPlantTemplates(plantId)
  );

  const [date, setDate] = useState(hoje());
  const [week, setWeek] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [observations, setObservations] = useState("");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [checklist, setChecklist] = useState<ChecklistEntry[]>([]);
  const [saving, setSaving] = useState(false);

  // Monta os campos editáveis a partir dos templates da planta
  useEffect(() => {
    if (!templates) return;
    const list: any[] = Array.isArray(templates)
      ? templates
      : (templates?.data ?? []);

    setMeasurements(
      list
        .filter((t) => (t.type ?? "MEASUREMENT") !== "CHECKLIST")
        .map((t) => ({
          template_id: String(t.id),
          field_name: t.field_name ?? "Campo",
          unit: t.unit ?? "",
          value: "",
        }))
    );

    setChecklist(
      list
        .filter((t) => t.type === "CHECKLIST")
        .map((t) => ({
          template_id: String(t.id),
          label: t.field_name ?? "Item",
          checked: false,
        }))
    );
  }, [templates]);

  const checkedTemplateIds = useMemo(
    () => checklist.filter((item) => item.checked).map((item) => item.template_id),
    [checklist]
  );

  function updateMeasurement(templateId: string, value: string) {
    setMeasurements((current) =>
      current.map((measurement) =>
        measurement.template_id === templateId
          ? { ...measurement, value }
          : measurement
      )
    );
  }

  function toggleChecklistItem(templateId: string) {
    setChecklist((current) =>
      current.map((item) =>
        item.template_id === templateId
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  }

  async function handleSave() {
    if (!list_id) {
      Alert.alert(
        "Lista não encontrada",
        "Abra o registro a partir de um canteiro para vincular a lista de formulários."
      );
      return;
    }

    try {
      setSaving(true);

      // 1) cria o formulário (registro semanal) na lista do canteiro
      const formulario = await createFormulario({
        list_id,
        type: "SEMANAL",
        observations,
      });
      const formularioId = formulario?.id ?? formulario?.data?.id;

      // 2) registra os itens de checklist marcados
      if (checkedTemplateIds.length > 0) {
        await createChecklistItems(formularioId, checkedTemplateIds);
      }

      // 3) registra as medições preenchidas
      const medicoesPreenchidas = measurements.filter((m) => m.value !== "");
      if (medicoesPreenchidas.length > 0) {
        await createMeasurements(
          formularioId,
          medicoesPreenchidas.map((measurement) => ({
            template_id: measurement.template_id,
            value: Number(measurement.value || 0),
          }))
        );
      }

      // 4) finaliza o formulário
      await finalizarFormulario(formularioId);

      router.replace(`/registro-salvo/${formularioId}`);
    } catch (error: any) {
      console.log("Erro ao salvar registro:", error);
      Alert.alert(
        "Erro ao salvar",
        "Não foi possível salvar o registro agora. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-14"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-slate-100"
          >
            <Text className="text-2xl text-slate-500">‹</Text>
          </Pressable>

          <Text className="flex-1 px-4 text-2xl font-bold text-slate-950">
            Novo Registro
          </Text>

          <View className="rounded-full bg-amber-100 px-3 py-2">
            <Text className="text-xs font-bold text-amber-600">⚡ Offline</Text>
          </View>
        </View>

        <SectionCard title="Informações Gerais" icon="🧮">
          <View className="flex-row flex-wrap justify-between">
            <FieldBox label="Data" value={date} onChangeText={setDate} />

            <FieldBox label="Semana" value={week} onChangeText={setWeek} />

            <FieldBox
              label="Início"
              value={startedAt}
              onChangeText={setStartedAt}
            />

            <FieldBox
              label="Término"
              value={endedAt}
              onChangeText={setEndedAt}
            />
          </View>
        </SectionCard>

        <SectionCard title="Medições" icon="📏">
          {loadingTemplates ? (
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} width="48%" height={64} radius={12} />
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {measurements.length === 0 ? (
                <Text className="text-sm text-slate-400">
                  Nenhum campo de medição configurado para esta planta.
                </Text>
              ) : (
                measurements.map((measurement) => (
                  <FieldBox
                    key={measurement.template_id}
                    label={`${measurement.field_name} (${measurement.unit})`}
                    value={measurement.value}
                    onChangeText={(value) =>
                      updateMeasurement(measurement.template_id, value)
                    }
                  />
                ))
              )}
            </View>
          )}

          <Text className="mb-2 mt-2 text-xs font-bold uppercase text-slate-400">
            Observações
          </Text>

          <TextInput
            value={observations}
            onChangeText={setObservations}
            placeholder="Descreva o estado da planta..."
            multiline
            textAlignVertical="top"
            className="min-h-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
            placeholderTextColor="#94a3b8"
          />
        </SectionCard>

        <SectionCard title="Registro Fotográfico" icon="📷">
          <PhotoUploadBox />
        </SectionCard>

        <SectionCard title="Checklist de Manejo" icon="✅">
          {loadingTemplates ? (
            <View className="gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={40} radius={10} />
              ))}
            </View>
          ) : checklist.length === 0 ? (
            <Text className="text-sm text-slate-400">
              Nenhum item de checklist configurado para esta planta.
            </Text>
          ) : (
            checklist.map((item) => (
              <ChecklistItem
                key={item.template_id}
                label={item.label}
                checked={item.checked}
                onPress={() => toggleChecklistItem(item.template_id)}
              />
            ))
          )}
        </SectionCard>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="mt-2 h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">
              Salvar registro
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
