import { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import useSWR, { mutate } from "swr";

import HeaderStack from "@/components/navigation/headerStack";
import { extractApiError } from "@/lib/apiError";
import { getRelatorioById, submitRelatorio } from "@/database/relatoriosService";

export default function RelatorioIndexScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: relatorio, isLoading } = useSWR(
    id ? `relatorio-${id}` : null,
    () => getRelatorioById(id)
  );

  const [submitting, setSubmitting] = useState(false);

  const rel = (relatorio as any)?.data ?? relatorio;
  const canteiroNome =
    rel?.list?.canteiro?.name ??
    rel?.list?.plant?.name ??
    `Canteiro ${id}`;

  const status: string = rel?.status ?? 'RASCUNHO';
  const emRascunho = status === 'RASCUNHO';

  const sectionStatus = (filled: boolean) => filled ? '✅' : '✏️';

  function handlePreviewPDF() {
    router.push(`/relatorios/${id}/pdf`);
  }

  function handleSubmit() {
    Alert.alert(
      "Submeter relatório?",
      "Depois de submetido, o relatório não poderá mais ser editado.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Submeter", onPress: submeter },
      ]
    );
  }

  async function submeter() {
    try {
      setSubmitting(true);
      await submitRelatorio(id);
      // Atualiza o detalhe e a lista de relatórios com o novo status
      await Promise.all([mutate(`relatorio-${id}`), mutate("relatorios")]);
      Alert.alert("Relatório submetido", "Seu relatório foi enviado com sucesso.");
      router.back();
    } catch (error) {
      Alert.alert(
        "Erro",
        extractApiError(error, "Não foi possível submeter o relatório agora.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View className="px-6 pb-6 bg-green-900 items-center gap-2 justify-center">
          <HeaderStack title="" />
          <Text>📄</Text>
          <Text className="text-2xl font-bold text-white">Relatório de Análise do Canteiro</Text>
          <Text className="text-white">{canteiroNome}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#14532d" className="mt-10" />
        ) : (
          <View className="p-6 gap-4">
            {!emRascunho ? (
              <View className="bg-emerald-50 rounded-2xl p-6 gap-2">
                <Text className="text-xs font-bold uppercase text-emerald-800">
                  {status === 'CORRIGIDO' ? 'Relatório corrigido' : 'Relatório submetido'}
                </Text>

                {status === 'CORRIGIDO' && rel?.grade != null ? (
                  <Text className="text-3xl font-bold text-green-900">
                    Nota {Number(rel.grade).toFixed(1)}
                  </Text>
                ) : status === 'SUBMETIDO' ? (
                  <Text className="text-sm text-slate-500">
                    Aguardando a correção do professor.
                  </Text>
                ) : null}

                {rel?.feedback ? (
                  <View className="mt-2">
                    <Text className="text-xs font-bold uppercase text-slate-400">
                      Feedback do professor
                    </Text>
                    <Text className="mt-1 text-base leading-6 text-slate-700">
                      {rel.feedback}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View className="bg-gray-50 rounded-2xl p-6 w-full gap-8">
              <TouchableOpacity
                className="flex-row justify-between w-full gap-2 items-center h-fit"
                onPress={() => router.push(`/relatorios/${id}/introducao`)}
              >
                <View className="bg-gray-400 items-center justify-center" style={{ width: 32, height: 32, borderRadius: 16 }}>
                  <Text>1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold">Introdução</Text>
                  <Text className="text-sm">Contexto e justificativa</Text>
                </View>
                <Text>{sectionStatus(!!rel?.introduction)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between w-full gap-2 items-center h-fit"
                onPress={() => router.push(`/relatorios/${id}/objetivo`)}
              >
                <View className="bg-gray-400 items-center justify-center" style={{ width: 32, height: 32, borderRadius: 16 }}>
                  <Text>2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold">Objetivo</Text>
                  <Text className="text-sm">Objetivos do acompanhamento</Text>
                </View>
                <Text>{sectionStatus(!!rel?.objective)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between w-full gap-2 items-center h-fit"
                onPress={() => router.push(`/relatorios/${id}/desenvolvimento`)}
              >
                <View className="bg-gray-400 items-center justify-center" style={{ width: 32, height: 32, borderRadius: 16 }}>
                  <Text>3</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold">Desenvolvimento</Text>
                  <Text className="text-sm">Registros organizados</Text>
                </View>
                <Text>{sectionStatus(!!rel?.development)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between w-full gap-2 items-center h-fit"
                onPress={() => router.push(`/relatorios/${id}/consideracoes`)}
              >
                <View className="bg-gray-400 items-center justify-center" style={{ width: 32, height: 32, borderRadius: 16 }}>
                  <Text>4</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold">Considerações finais</Text>
                  <Text className="text-sm">Conclusões e aprendizados</Text>
                </View>
                <Text>{sectionStatus(!!rel?.final_thoughts)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between w-full gap-2 items-center h-fit"
                onPress={() => router.push(`/relatorios/${id}/referencias`)}
              >
                <View className="bg-gray-400 items-center justify-center" style={{ width: 32, height: 32, borderRadius: 16 }}>
                  <Text>5</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold">Referências</Text>
                  <Text className="text-sm">Fontes consultadas</Text>
                </View>
                <Text>{sectionStatus(!!rel?.references)}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="border p-6 items-center rounded-2xl"
              onPress={handlePreviewPDF}
            >
              <Text className="font-semibold">Visualizar PDF</Text>
            </TouchableOpacity>

            {emRascunho ? (
              <TouchableOpacity
                className="bg-green-900 p-6 items-center rounded-2xl"
                disabled={submitting}
                onPress={handleSubmit}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold">Submeter Relatório</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </ScrollView>
    </>
  );
}
