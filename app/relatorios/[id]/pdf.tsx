import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import useSWR from "swr";

import HeaderStack from "@/components/navigation/headerStack";
import { PdfViewer } from "@/components/relatorios/PdfViewer";
import { downloadRelatorioPDF } from "@/database/relatoriosService";
import { extractApiError } from "@/lib/apiError";

// Baixa o PDF para o cache do app e lê o conteúdo para o visualizador
async function carregarPdf(id: string) {
  const uri = await downloadRelatorioPDF(id);
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return { uri, base64 };
}

export default function RelatorioPdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: pdf,
    error,
    isLoading,
    mutate: recarregar,
  } = useSWR(id ? `relatorio-pdf-${id}` : null, () => carregarPdf(String(id)), {
    // O PDF é pesado: não rebaixa ao voltar para o app nem a cada reconexão
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const [erroVisualizador, setErroVisualizador] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const erro = error
    ? extractApiError(error, "Não foi possível gerar o PDF agora. Tente novamente.")
    : erroVisualizador;

  function handleTentarNovamente() {
    setErroVisualizador(null);
    recarregar();
  }

  async function handleCompartilhar() {
    if (!pdf) return;

    try {
      setSharing(true);
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Indisponível", "Este aparelho não permite compartilhar arquivos.");
        return;
      }
      // Abre a folha do sistema: salvar em Arquivos/Drive, abrir em outro app ou enviar
      await Sharing.shareAsync(pdf.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Baixar relatório",
      });
    } catch {
      Alert.alert("Erro", "Não foi possível abrir as opções de download.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-5">
        <HeaderStack title="Visualizar PDF" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#14532d" />
          <Text className="mt-3 text-sm text-slate-400">Gerando PDF...</Text>
        </View>
      ) : erro || !pdf ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="mb-4 text-center text-base text-red-600">
            {erro ?? "Não foi possível carregar o PDF."}
          </Text>
          <Pressable
            onPress={handleTentarNovamente}
            className="rounded-2xl border border-emerald-800 px-6 py-3 active:opacity-80"
          >
            <Text className="font-bold text-emerald-800">Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View className="flex-1">
            <PdfViewer base64={pdf.base64} onError={setErroVisualizador} />
          </View>

          <View className="border-t border-slate-100 bg-slate-50 px-5 pb-8 pt-3">
            <Pressable
              onPress={handleCompartilhar}
              disabled={sharing}
              className="h-14 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
            >
              {sharing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Baixar / Compartilhar
                </Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
