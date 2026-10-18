import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import useSWR from "swr";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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
import { extractApiError } from "@/lib/apiError";

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

  const { data: templates } = useSWR(
    plantId ? `plant-templates-${plantId}` : null,
    () => getPlantTemplates(plantId)
  );

  // Estados Visuais do Formulário
  const [date, setDate] = useState(hoje());
  const [week, setWeek] = useState("");
  const [clima, setClima] = useState("");
  const [fasePlanta, setFasePlanta] = useState("");
  const [alturaEstimada, setAlturaEstimada] = useState("");
  const [observations, setObservations] = useState("");
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [saving, setSaving] = useState(false);

  // Checklist Fixo do MVP
  const [checklistFixo, setChecklistFixo] = useState([
    { id: "irrigacao", label: "Irrigação realizada", checked: false },
    { id: "limpeza", label: "Limpeza / Capina", checked: false },
    { id: "adubacao", label: "Adubação de cobertura", checked: false },
    { id: "plantio", label: "Plantio / Replantio", checked: false },
    { id: "pragas", label: "Controle de pragas", checked: false },
  ]);

  // Estados de Mapeamento para o Banco de Dados (Fallback)
  const [alturaTplId, setAlturaTplId] = useState("");
  const [checklistTplIds, setChecklistTplIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!templates) return;
    const list: any[] = Array.isArray(templates) ? templates : (templates?.data ?? []);

    const alturaTpl = list.find((t) => t.field_name?.toLowerCase().includes("altura"));
    if (alturaTpl) setAlturaTplId(String(alturaTpl.id));

    const mapping: Record<string, string> = {};
    list.forEach((t) => {
      if (t.type === "CHECKLIST" && t.field_name) {
        const name = t.field_name.toLowerCase();
        if (name.includes("irriga")) mapping["irrigacao"] = String(t.id);
        if (name.includes("limpeza") || name.includes("capina")) mapping["limpeza"] = String(t.id);
        if (name.includes("aduba")) mapping["adubacao"] = String(t.id);
        if (name.includes("plantio") || name.includes("replantio")) mapping["plantio"] = String(t.id);
        if (name.includes("praga")) mapping["pragas"] = String(t.id);
      }
    });
    setChecklistTplIds(mapping);
  }, [templates]);

  function toggleChecklistFixo(id: string) {
    setChecklistFixo((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }

  async function handleSave() {
    if (!list_id) {
      Alert.alert("Lista não encontrada", "Abra o registro a partir de um canteiro.");
      return;
    }

    try {
      setSaving(true);

      const itensChecados = checklistFixo.filter((i) => i.checked);
      const nomesChecklist = itensChecados.map((i) => i.label).join(", ");
      
      const observacoesFinais = `Clima: ${clima || "-"} | Fase: ${fasePlanta || "-"} | Altura: ${alturaEstimada ? alturaEstimada + " cm" : "-"}
Checklist: ${nomesChecklist || "Nenhum"}

Observações: ${observations}`;

      const formulario = await createFormulario({
        list_id,
        type: "SEMANAL",
        observations: observacoesFinais,
      });
      const formularioId = formulario?.id ?? formulario?.data?.id;

      if (!formularioId) throw new Error("A API não retornou o ID do formulário criado.");

      if (photo) {
        await uploadFormularioPhoto(formularioId, photo);
      }

      const validTemplateIds = itensChecados.map((i) => checklistTplIds[i.id]).filter(Boolean);
      if (validTemplateIds.length > 0) {
        await createChecklistItems(formularioId, validTemplateIds);
      }

      if (alturaEstimada && alturaTplId) {
        await createMeasurements(formularioId, [
          { template_id: alturaTplId, value: Number(alturaEstimada) },
        ]);
      }

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
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-14"
        showsVerticalScrollIndicator={false}
        bottomOffset={40}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-slate-100">
            <Text className="text-2xl text-slate-500">‹</Text>
          </Pressable>
          <Text className="flex-1 px-4 text-2xl font-bold text-slate-950">Novo Registro</Text>
          <View className="rounded-full bg-amber-100 px-3 py-2">
            <Text className="text-xs font-bold text-amber-600">Rascunho</Text>
          </View>
        </View>

        {/* INFORMAÇÕES GERAIS */}
        <SectionCard title="Informações Gerais" icon="">
          <View className="flex-row flex-wrap justify-between mb-4">
            <FieldBox label="Data" value={date} onChangeText={setDate} />
            <FieldBox label="Semana (opcional)" value={week} onChangeText={setWeek} />
          </View>
          <Text className="mb-2 text-sm font-bold uppercase text-slate-600">Condições do Tempo</Text>
          <View className="flex-row justify-between gap-2">
            {["Sol ☀️", "Nublado ☁️", "Chuva 🌧️"].map((opcao) => (
              <TouchableOpacity
                key={opcao}
                onPress={() => setClima(opcao)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  clima === opcao ? "bg-emerald-700 border-emerald-700" : "bg-slate-50 border-slate-300"
                }`}
              >
                <Text className={`text-base ${clima === opcao ? "text-white font-bold" : "text-slate-700 font-medium"}`}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* ESTADO DA PLANTA (Apenas Altura) */}
        <SectionCard title="Estado da Planta" icon="🌱">
          <View className="mb-4">
            <FieldBox
              label="Altura estimada (cm) (opcional)"
              value={alturaEstimada}
              onChangeText={setAlturaEstimada}
            />
          </View>
          <Text className="mb-2 text-sm font-bold uppercase text-slate-600">Fase da planta (opcional)</Text>
          <View className="flex-row justify-between gap-2">
            {[
              { id: 'Vegetativo 🌱', texto: 'Vegetativo', emoji: '🌱' },
              { id: 'Elongação 🌿', texto: 'Elongação', emoji: '🌿' },
              { id: 'Florescimento 🌷', texto: 'Florescimento', emoji: '🌷' }
            ].map((fase) => (
              <TouchableOpacity
                key={fase.id}
                onPress={() => setFasePlanta(fase.id)}
                className={`flex-1 py-3 rounded-xl border items-center justify-center px-1 ${
                  fasePlanta === fase.id ? "bg-emerald-700 border-emerald-700" : "bg-slate-50 border-slate-300"
                }`}
              >
                {/* Aqui adicionamos as propriedades para não quebrar a linha */}
                <Text 
                  numberOfLines={1} 
                  adjustsFontSizeToFit 
                  className={`text-center text-base w-full ${fasePlanta === fase.id ? "text-white font-bold" : "text-slate-700 font-medium"}`}
                >
                  {fase.texto}
                </Text>
                <Text className="text-center text-base mt-1">
                  {fase.emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* FOTOS */}
        <SectionCard title="Registro Fotográfico" icon="📷">
          <PhotoUploadBox photoBase64={photo?.base64} onPhotoSelected={setPhoto} />
        </SectionCard>

        {/* CHECKLIST FIXO MVP */}
        <SectionCard title="Checklist de Manejo" icon="✅">
          {checklistFixo.map((item) => (
            <ChecklistItem
              key={item.id}
              label={item.label}
              checked={item.checked}
              onPress={() => toggleChecklistFixo(item.id)}
            />
          ))}
        </SectionCard>

        {/* OBSERVAÇÕES */}
        <SectionCard title="Observações Gerais" icon="📝">
          <TextInput
            value={observations}
            onChangeText={setObservations}
            placeholder="Ex: Descreva como a planta está se desenvolvendo..."
            multiline
            textAlignVertical="top"
            className="min-h-32 rounded-xl border border-slate-300 bg-white px-4 py-4 text-lg text-slate-800"
            placeholderTextColor="#94a3b8"
          />
        </SectionCard>

        {/* BOTÃO SALVAR */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="mt-2 mb-8 h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
        >
          {saving ? <ActivityIndicator color="#ffffff" /> : <Text className="text-base font-bold text-white">Salvar registro</Text>}
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}