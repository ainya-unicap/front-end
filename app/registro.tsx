import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import useSWR from "swr";

import {
  createChecklistItems,
  createFormulario,
  createMeasurements,
  finalizarFormulario,
  uploadFormularioPhoto,
} from "@/database/formularios";
import { getListaById } from "@/database/listasFormularios";
import { getPlantTemplates } from "@/database/plantTemplates";

import { FieldBox } from "@/components/registro/FieldBox";
import { SectionCard } from "@/components/registro/SectionCard";
import { ChecklistItem } from "@/components/registro/ChecklistItem";
import { PhotoUploadBox } from "@/components/registro/PhotoUploadBox";
import type { SelectedPhoto } from "@/components/registro/PhotoUploadBox";
import { Skeleton } from "@/components/ui/Skeleton";
import { extractApiError } from "@/lib/apiError";

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
  const { list_id } = useLocalSearchParams<{ list_id?: string }>();

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

  // Estados do Formulário
  const [date, setDate] = useState(hoje());
  const [week, setWeek] = useState("");
  const [clima, setClima] = useState(""); // Novo campo
  const [fasePlanta, setFasePlanta] = useState(""); // Novo campo
  const [observations, setObservations] = useState("");
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [checklist, setChecklist] = useState<ChecklistEntry[]>([]);
  const [saving, setSaving] = useState(false);

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

      // Concatenando dados visuais extras nas observações
      const observacoesFinais = `Clima: ${clima || 'Não informado'} | Fase: ${fasePlanta || 'Não informada'}\n\n${observations}`;

      // 1) cria o formulário
      const formulario = await createFormulario({
        list_id,
        type: "SEMANAL",
        observations: observacoesFinais,
      });
      const formularioId = formulario?.id ?? formulario?.data?.id;

      if (!formularioId) {
        throw new Error("A API não retornou o ID do formulário criado.");
      }

      // Lógica de upload de foto
      if (photo) {
        await uploadFormularioPhoto(formularioId, photo);
      }

      // 2) registra os itens de checklist
      if (checkedTemplateIds.length > 0) {
        await createChecklistItems(formularioId, checkedTemplateIds);
      }

      // 3) registra as medições
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
    } catch (error: unknown) {
      Alert.alert(
        "Erro ao salvar",
        extractApiError(error, "Não foi possível salvar o registro agora. Tente novamente.")
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
            <Text className="text-xs font-bold text-amber-600">Rascunho</Text>
          </View>
        </View>

        {/* INFORMAÇÕES GERAIS */}
        <SectionCard title="Informações Gerais" icon="📅">
          <View className="flex-row flex-wrap justify-between mb-4">
            <FieldBox label="Data" value={date} onChangeText={setDate} />
            <FieldBox label="Semana (opcional)" value={week} onChangeText={setWeek} />
          </View>

          <Text className="mb-2 text-xs font-bold uppercase text-slate-400">Condições do Tempo</Text>
          <View className="flex-row justify-between gap-2">
            {['Sol ☀️', 'Nublado ☁️', 'Chuva 🌧️'].map((opcao) => (
              <TouchableOpacity
                key={opcao}
                onPress={() => setClima(opcao)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  clima === opcao ? 'bg-emerald-700 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text className={clima === opcao ? 'text-white font-bold' : 'text-slate-600'}>
                  {opcao}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* ESTADO DA PLANTA (Antigo Medições) */}
        <SectionCard title="Estado da Planta" icon="🌱">
          {loadingTemplates ? (
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} width="48%" height={64} radius={12} />
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between mb-4">
              {measurements.length === 0 ? (
                <Text className="text-sm text-slate-400 mb-4">
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

          <Text className="mb-2 text-xs font-bold uppercase text-slate-400">Fase da planta (opcional)</Text>
          <View className="flex-row justify-between gap-2">
            {['Vegetativo 🌱', 'Elongação 🌿', 'Florescimento 🌷'].map((fase) => (
              <TouchableOpacity
                key={fase}
                onPress={() => setFasePlanta(fase)}
                className={`flex-1 py-3 rounded-xl border items-center px-1 ${
                  fasePlanta === fase ? 'bg-emerald-700 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text className={`text-center text-xs ${fasePlanta === fase ? 'text-white font-bold' : 'text-slate-600'}`}>
                  {fase}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* FOTOS */}
        <SectionCard title="Registro Fotográfico" icon="📷">
          <PhotoUploadBox
            photoBase64={photo?.base64}
            onPhotoSelected={setPhoto}
          />
        </SectionCard>

        {/* CHECKLIST */}
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

        {/* OBSERVAÇÕES */}
        <SectionCard title="Observações Gerais" icon="📝">
          <TextInput
            value={observations}
            onChangeText={setObservations}
            placeholder="Ex: Descreva como a planta está se desenvolvendo, sinais de pragas, estado do solo..."
            multiline
            textAlignVertical="top"
            className="min-h-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
            placeholderTextColor="#94a3b8"
          />
        </SectionCard>

        {/* BOTÃO SALVAR */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="mt-2 mb-8 h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
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