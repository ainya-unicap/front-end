import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import HeaderStack from "@/components/navigation/headerStack";
import { PdfViewer } from "@/components/relatorios/PdfViewer";
import { downloadRelatorioPDF } from "@/database/relatoriosService";
import { extractApiError } from "@/lib/apiError";

export default function RelatorioPdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [fileUri, setFileUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const uri = await downloadRelatorioPDF(String(id));
      const content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setFileUri(uri);
      setBase64(content);
    } catch (error) {
      setErro(
        extractApiError(error, "Não foi possível gerar o PDF agora. Tente novamente.")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) carregar();
  }, [id, carregar]);

  async function handleCompartilhar() {
    if (!fileUri) return;

    try {
      setSharing(true);
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Indisponível", "Este aparelho não permite compartilhar arquivos.");
        return;
      }
      // Abre a folha do sistema: salvar em Arquivos/Drive, abrir em outro app ou enviar
      await Sharing.shareAsync(fileUri, {
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

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#14532d" />
          <Text className="mt-3 text-sm text-slate-400">Gerando PDF...</Text>
        </View>
      ) : erro || !base64 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="mb-4 text-center text-base text-red-600">
            {erro ?? "Não foi possível carregar o PDF."}
          </Text>
          <Pressable
            onPress={carregar}
            className="rounded-2xl border border-emerald-800 px-6 py-3 active:opacity-80"
          >
            <Text className="font-bold text-emerald-800">Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View className="flex-1">
            <PdfViewer base64={base64} onError={setErro} />
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
