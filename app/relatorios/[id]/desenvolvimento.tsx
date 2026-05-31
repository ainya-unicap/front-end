import StepControl from "@/components/forms/stepControll";
import Warning from "@/components/forms/warning";
import HeaderStack from "@/components/navigation/headerStack";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ScrollView, TextInput, Alert } from "react-native";
import useSWR from "swr";
import {
  getRelatorioById,
  updateRelatorioDevelopment,
} from "@/database/relatoriosService";

export default function DesenvolvimentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: relatorio, isLoading } = useSWR(
    id ? `relatorio-${id}` : null,
    () => getRelatorioById(id)
  );

  const [development, setDevelopment] = useState("");

  // Carrega o texto de desenvolvimento já salvo no relatório
  useEffect(() => {
    const r = (relatorio as any)?.data ?? relatorio;
    if (r) {
      setDevelopment(r.development ?? "");
    }
  }, [relatorio]);

  // Salva o desenvolvimento e volta para a visão geral do relatório
  async function handleNext() {
    try {
      await updateRelatorioDevelopment(id, development);
      router.push(`/relatorios/${id}`);
    } catch (error) {
      console.error("Erro ao salvar desenvolvimento:", error);
      Alert.alert("Erro", "Não foi possível salvar o desenvolvimento agora.");
    }
  }

  return (
    <>
      <ScrollView>
        <View className="p-6 pt-0 gap-4 bg-[#f8fafc]">
          <HeaderStack title="Seção 3 — Desenvolvimento" />
          <Warning text="📋 Gerado automaticamente dos seus registros. Edite o texto se desejar." />

          {isLoading ? (
            <Skeleton width="100%" height={240} radius={12} />
          ) : (
            <TextInput
              multiline
              numberOfLines={12}
              textAlignVertical="top"
              placeholder="Descreva o desenvolvimento observado ao longo das semanas..."
              placeholderTextColor="#94a3b8"
              className="bg-white rounded-xl p-4 text-gray-700 text-base border border-gray-200 min-h-[240px]"
              value={development}
              onChangeText={setDevelopment}
            />
          )}
        </View>
      </ScrollView>
      <StepControl nextStep={handleNext} />
    </>
  );
}
