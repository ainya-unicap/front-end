import { useState } from "react";
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
  createFormulario,
  finalizarFormulario,
  uploadFormularioPhoto,
} from "@/database/formularios";
import { getListaById } from "@/database/listasFormularios";

import { FieldBox } from "@/components/registro/FieldBox";
import { SectionCard } from "@/components/registro/SectionCard";
import { ChecklistItem } from "@/components/registro/ChecklistItem";
import {
  MAX_REGISTRO_PHOTOS,
  MIN_REGISTRO_PHOTOS,
  PhotoUploadBox,
} from "@/components/registro/PhotoUploadBox";
import type { SelectedPhoto } from "@/components/registro/PhotoUploadBox";
import { extractApiError } from "@/lib/apiError";

function hoje() {
  return new Date().toLocaleDateString("pt-BR");
}

function dataParaISOString(data: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  if (!match) return null;

  const [, dia, mes, ano] = match;
  const parsedDate = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  if (
    parsedDate.getUTCFullYear() !== Number(ano) ||
    parsedDate.getUTCMonth() !== Number(mes) - 1 ||
    parsedDate.getUTCDate() !== Number(dia)
  ) {
    return null;
  }

  return parsedDate.toISOString();
}

export default function RegistroScreen() {
  const { list_id } = useLocalSearchParams<{ list_id?: string }>();

  const { data: lista } = useSWR(list_id ? `lista-${list_id}` : null, () =>
    getListaById(list_id as string)
  );

  const listaObj = (lista as any)?.data ?? lista;

  // Estados Visuais do Formulário
  const [date, setDate] = useState(hoje());
  const [week, setWeek] = useState("");
  const [clima, setClima] = useState<"SOL" | "NUBLADO" | "CHUVA" | "">("");
  const [fasePlanta, setFasePlanta] = useState<
    "VEGETATIVO" | "ELONGACAO" | "FLORESCIMENTO" | ""
  >("");
  const [alturaEstimada, setAlturaEstimada] = useState("");
  const [observations, setObservations] = useState("");
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [saving, setSaving] = useState(false);

  // Checklist Fixo do MVP
  const [checklistFixo, setChecklistFixo] = useState([
    { id: "irrigacao", label: "Irrigação realizada", checked: false },
    { id: "limpeza", label: "Limpeza / Capina", checked: false },
    { id: "adubacao", label: "Adubação de cobertura", checked: false },
    { id: "plantio", label: "Plantio / Replantio", checked: false },
    { id: "pragas", label: "Controle de pragas", checked: false },
  ]);

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

    if (photos.length < MIN_REGISTRO_PHOTOS || photos.length > MAX_REGISTRO_PHOTOS) {
      Alert.alert(
        "Quantidade de fotos inválida",
        `Adicione no mínimo ${MIN_REGISTRO_PHOTOS} e no máximo ${MAX_REGISTRO_PHOTOS} fotos para salvar o registro.`
      );
      return;
    }

    try {
      const dataISO = dataParaISOString(date);
      if (!dataISO) {
        Alert.alert("Data inválida", "Informe uma data válida no formato dd/mm/aaaa.");
        return;
      }

      const semana = week.trim() ? Number(week) : undefined;
      if (semana !== undefined && (!Number.isInteger(semana) || semana < 1)) {
        Alert.alert("Semana inválida", "Informe um número de semana válido.");
        return;
      }

      const altura = alturaEstimada.trim() ? Number(alturaEstimada) : undefined;
      if (altura !== undefined && (!Number.isFinite(altura) || altura < 0)) {
        Alert.alert("Altura inválida", "Informe uma altura válida em centímetros.");
        return;
      }

      setSaving(true);

      const nomeCanteiro =
        listaObj?.canteiro?.name ?? listaObj?.name ?? "Canteiro";
      const title = `${semana ? `Semana ${semana}` : "Registro semanal"} — ${nomeCanteiro}`;

      const formulario = await createFormulario({
        list_id,
        type: "SEMANAL",
        title,
        date: dataISO,
        ...(semana !== undefined ? { week: semana } : {}),
        ...(clima ? { weather: clima } : {}),
        ...(altura !== undefined ? { estimated_height_cm: altura } : {}),
        ...(fasePlanta ? { phenological_stage: fasePlanta } : {}),
        checklist_irrigacao: checklistFixo.find((i) => i.id === "irrigacao")?.checked ?? false,
        checklist_capina: checklistFixo.find((i) => i.id === "limpeza")?.checked ?? false,
        checklist_adubacao: checklistFixo.find((i) => i.id === "adubacao")?.checked ?? false,
        checklist_plantio: checklistFixo.find((i) => i.id === "plantio")?.checked ?? false,
        checklist_pragas: checklistFixo.find((i) => i.id === "pragas")?.checked ?? false,
        observations,
      });
      const formularioId = formulario?.id ?? formulario?.data?.id;

      if (!formularioId) throw new Error("A API não retornou o ID do formulário criado.");

      for (const photo of photos) {
        await uploadFormularioPhoto(formularioId, photo);
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
            {[
              { label: "Sol ☀️", value: "SOL" as const },
              { label: "Nublado ☁️", value: "NUBLADO" as const },
              { label: "Chuva 🌧️", value: "CHUVA" as const },
            ].map((opcao) => (
              <TouchableOpacity
                key={opcao.value}
                onPress={() => setClima(opcao.value)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  clima === opcao.value ? "bg-emerald-700 border-emerald-700" : "bg-slate-50 border-slate-300"
                }`}
              >
                <Text className={`text-base ${clima === opcao.value ? "text-white font-bold" : "text-slate-700 font-medium"}`}>{opcao.label}</Text>
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
              { id: "VEGETATIVO" as const, texto: "Vegetativo", emoji: "🌱" },
              { id: "ELONGACAO" as const, texto: "Elongação", emoji: "🌿" },
              { id: "FLORESCIMENTO" as const, texto: "Florescimento", emoji: "🌷" },
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
          <PhotoUploadBox photos={photos} onPhotosChange={setPhotos} />
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