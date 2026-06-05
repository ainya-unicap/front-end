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
import useSWR from "swr";

import HeaderStack from "@/components/navigation/headerStack";
import { getRelatorioById, submitRelatorio, exportRelatorioPDF } from "@/database/relatoriosService";

export default function RelatorioIndexScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: relatorio, isLoading } = useSWR(
    id ? `relatorio-${id}` : null,
    () => getRelatorioById(id)
  );

  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const rel = (relatorio as any)?.data ?? relatorio;
  const canteiroNome =
    rel?.list?.canteiro?.name ??
    rel?.list?.plant?.name ??
    `Canteiro ${id}`;

  const sectionStatus = (filled: boolean) => filled ? '✅' : '✏️';

  async function handlePreviewPDF() {
    try {
      setExporting(true);
      await exportRelatorioPDF(id);
      Alert.alert("PDF gerado", "A pré-visualização do PDF foi gerada com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar o PDF agora.");
    } finally {
      setExporting(false);
    }
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      await submitRelatorio(id);
      Alert.alert("Relatório submetido", "Seu relatório foi enviado com sucesso.");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível submeter o relatório agora.");
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
              disabled={exporting}
              onPress={handlePreviewPDF}
            >
              {exporting ? (
                <ActivityIndicator color="#14532d" />
              ) : (
                <Text className="font-semibold">Pré-visualizar PDF</Text>
              )}
            </TouchableOpacity>

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
          </View>
        )}
      </ScrollView>
    </>
  );
}
