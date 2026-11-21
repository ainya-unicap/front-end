import { useState } from "react";
import { ActivityIndicator, Alert, Linking, Text, View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import useSWR, { mutate } from "swr";

import HeaderStack from "@/components/navigation/headerStack";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  cancelarEntregaDaTurma,
  enviarRelatorioParaTurma,
  getMinhasTurmas,
  type MinhaTurma,
} from "@/database/turmas";
import { extractApiError } from "@/lib/apiError";

// Mesmo limite do backend
const TAMANHO_MAXIMO_MB = 15;

function formatarData(iso: string) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";

  return `${data.toLocaleDateString("pt-BR")} às ${data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function TurmaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: turmas, isLoading } = useSWR("minhas-turmas", getMinhasTurmas);

  const turma: MinhaTurma | undefined = (turmas ?? []).find((item) => item.id === id);

  const [enviando, setEnviando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  async function enviar(arquivo: { uri: string; name: string }) {
    if (!turma) return;

    try {
      setEnviando(true);
      await enviarRelatorioParaTurma(turma.id, arquivo);
      await mutate("minhas-turmas");
      Alert.alert("Relatório enviado", "A professora já pode ver o seu PDF.");
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      Alert.alert(
        "Não foi possível enviar",
        status === 413
          ? `O arquivo passa de ${TAMANHO_MAXIMO_MB} MB.`
          : extractApiError(error, "Verifique sua conexão e tente novamente.")
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleEscolherPdf() {
    if (!turma || enviando) return;

    const resultado = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (resultado.canceled || !resultado.assets?.length) return;

    const arquivo = resultado.assets[0];

    if (arquivo.size && arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      Alert.alert("Arquivo muito grande", `O PDF deve ter no máximo ${TAMANHO_MAXIMO_MB} MB.`);
      return;
    }

    const aviso = turma.entrega
      ? "\n\nIsso substitui o relatório que você já enviou para esta turma."
      : "";

    Alert.alert(
      "Enviar para a professora?",
      `Arquivo: ${arquivo.name}\nTurma: ${turma.name}${aviso}`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Enviar", onPress: () => enviar({ uri: arquivo.uri, name: arquivo.name }) },
      ]
    );
  }

  function handleCancelar() {
    if (!turma) return;

    Alert.alert(
      "Cancelar a entrega?",
      "O PDF enviado será removido e a professora deixará de vê-lo. Você poderá enviar outro depois.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar entrega",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelando(true);
              await cancelarEntregaDaTurma(turma.id);
              await mutate("minhas-turmas");
            } catch (error) {
              Alert.alert(
                "Não foi possível cancelar",
                extractApiError(error, "Tente novamente em instantes.")
              );
            } finally {
              setCancelando(false);
            }
          },
        },
      ]
    );
  }

  const ocupado = enviando || cancelando;
  const entrega = turma?.entrega ?? null;
  const podeAbrir = !!entrega?.fileUrl && /^https?:\/\//.test(entrega.fileUrl);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <HeaderStack title="Minha turma" />

        {isLoading ? (
          <View className="gap-3">
            <Skeleton width="100%" height={96} radius={16} />
            <Skeleton width="100%" height={160} radius={16} />
          </View>
        ) : !turma ? (
          <Text className="py-10 text-center text-slate-400">Turma não encontrada.</Text>
        ) : (
          <>
            {/* Dados da turma */}
            <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
              <View className="mb-3 flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                  <AppIcon name="users" size={26} color="#166534" />
                </View>
                <Text className="flex-1 text-lg font-bold text-slate-900">{turma.name}</Text>
              </View>

              {turma.period?.name ? (
                <View className="mb-1.5 flex-row items-center">
                  <AppIcon name="calendar" size={16} color="#64748b" />
                  <Text className="ml-2 text-sm text-slate-500">{turma.period.name}</Text>
                </View>
              ) : null}
              {turma.institution?.name ? (
                <View className="flex-row items-center">
                  <AppIcon name="buildings" size={16} color="#64748b" />
                  <Text className="ml-2 flex-1 text-sm text-slate-500">
                    {turma.institution.name}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Entrega do relatório */}
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <View className="mb-3 flex-row items-center">
                <AppIcon name="file" size={20} color="#065f46" />
                <Text className="ml-2 text-base font-bold text-slate-900">
                  Relatório para a professora
                </Text>
              </View>

              {entrega ? (
                <View className="mb-4 rounded-xl bg-emerald-50 p-3">
                  <View className="mb-1 flex-row items-center">
                    <AppIcon name="check" size={16} color="#047857" />
                    <Text className="ml-1.5 text-sm font-bold text-emerald-800">Entregue</Text>
                  </View>
                  <Text className="text-sm text-slate-700" numberOfLines={2}>
                    {entrega.fileName}
                  </Text>
                  <Text className="mt-0.5 text-xs text-slate-500">
                    Enviado em {formatarData(entrega.submittedAt)}
                  </Text>
                </View>
              ) : (
                <Text className="mb-4 text-sm leading-5 text-slate-500">
                  Você ainda não enviou o relatório desta turma. Escolha um arquivo PDF do
                  seu celular (até 10 páginas e {TAMANHO_MAXIMO_MB} MB).
                </Text>
              )}

              {enviando ? (
                <View className="mb-3 flex-row items-center justify-center">
                  <ActivityIndicator color="#065f46" />
                  <Text className="ml-2 text-sm text-slate-500">Enviando o PDF...</Text>
                </View>
              ) : null}

              <View className="gap-3">
                <Button
                  label={entrega ? "Substituir PDF" : "Escolher PDF e enviar"}
                  onPress={handleEscolherPdf}
                  loading={enviando}
                  disabled={ocupado}
                />

                {podeAbrir ? (
                  <Button
                    label="Ver PDF enviado"
                    variant="ghost"
                    onPress={() => Linking.openURL(entrega!.fileUrl)}
                    disabled={ocupado}
                  />
                ) : null}

                {entrega?.podeCancelar ? (
                  <Button
                    label="Cancelar entrega"
                    variant="ghost"
                    onPress={handleCancelar}
                    loading={cancelando}
                    disabled={enviando}
                  />
                ) : null}
              </View>

              {entrega ? (
                <Text className="mt-3 text-xs leading-4 text-slate-400">
                  {entrega.podeCancelar
                    ? "Você pode cancelar a entrega até 24 horas depois do envio."
                    : "O prazo de 24 horas para cancelar já passou. Para corrigir, envie um novo PDF e ele substitui este."}
                </Text>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
