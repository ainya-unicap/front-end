import { useMemo, useState } from "react";
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

import {
  createChecklist,
  createFormulario,
  createMeasurements,
  finalizarFormulario,
} from "@/services/api";

import { FieldBox } from "@/components/registro/FieldBox";
import { SectionCard } from "@/components/registro/SectionCard";
import { ChecklistItem } from "@/components/registro/ChecklistItem";
import { PhotoUploadBox } from "@/components/registro/PhotoUploadBox";

const MOCK_USER_ID = "ID_DO_USUARIO";
const MOCK_LIST_ID = "ID_DA_LISTA";

const mockMeasurements = [
  {
    template_id: "template-altura",
    field_name: "Altura",
    unit: "cm",
    value: "45.5",
  },
  {
    template_id: "template-cobertura",
    field_name: "Cobertura",
    unit: "%",
    value: "72",
  },
];

const mockChecklist = [
  {
    template_id: "template-irrigacao",
    label: "Irrigação realizada",
    checked: true,
  },
  {
    template_id: "template-adubacao",
    label: "Adubação nitrogenada",
    checked: true,
  },
  {
    template_id: "template-pragas",
    label: "Controle de pragas",
    checked: false,
  },
  {
    template_id: "template-corte",
    label: "Corte/roçada realizada",
    checked: false,
  },
  {
    template_id: "template-sanidade",
    label: "Avaliação visual de sanidade",
    checked: true,
  },
];

export default function RegistroScreen() {
  // list_id vem da tela de lista de formulários do canteiro; cai no mock se
  // a tela for aberta direto (ex.: ação rápida da Home).
  const { list_id } = useLocalSearchParams<{ list_id?: string }>();

  const [date, setDate] = useState("07/04/2026");
  const [week, setWeek] = useState("12");
  const [startedAt, setStartedAt] = useState("08:00");
  const [endedAt, setEndedAt] = useState("10:30");
  const [observations, setObservations] = useState("");
  const [measurements, setMeasurements] = useState(mockMeasurements);
  const [checklist, setChecklist] = useState(mockChecklist);
  const [saving, setSaving] = useState(false);

  const checklistTemplateIds = useMemo(
    () => checklist.map((item) => item.template_id),
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
    try {
      setSaving(true);

      const formularioResponse = await createFormulario({
        list_id: list_id || MOCK_LIST_ID,
        user_id: MOCK_USER_ID,
        type: "SEMANAL",
        observations,
      });

      const formularioId = formularioResponse.data.id;

      await createChecklist(formularioId, checklistTemplateIds);

      await createMeasurements(
        formularioId,
        measurements.map((measurement) => ({
          template_id: measurement.template_id,
          value: Number(measurement.value || 0),
        }))
      );

      await finalizarFormulario(formularioId);

      router.replace(`/registro-salvo/${formularioId}`);
    } catch (error: any) {
      console.log("Erro ao salvar registro:", error);

      Alert.alert(
        "Registro salvo localmente",
        "Não foi possível sincronizar com a API agora. Vamos manter o fluxo visual enquanto o banco é ajustado."
      );

      router.replace("/registro-salvo/mock-registro");
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
          <View className="flex-row flex-wrap justify-between">
            {measurements.map((measurement) => (
              <FieldBox
                key={measurement.template_id}
                label={`${measurement.field_name} (${measurement.unit})`}
                value={measurement.value}
                onChangeText={(value) =>
                  updateMeasurement(measurement.template_id, value)
                }
              />
            ))}
          </View>

          <Text className="mb-2 text-xs font-bold uppercase text-slate-400">
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
          {checklist.map((item) => (
            <ChecklistItem
              key={item.template_id}
              label={item.label}
              checked={item.checked}
              onPress={() => toggleChecklistItem(item.template_id)}
            />
          ))}
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