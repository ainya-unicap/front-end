import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import useSWR from "swr";

import HeaderStack from "@/components/navigation/headerStack";
import { getRelatorioById } from "@/database/relatoriosService";
import { isLikelyOnline, subscribeOnlineState } from "@/database/offlineSync";
import { AppIcon } from "@/components/ui/AppIcon";

const SECTIONS = [
  { number: 1, key: "introduction", title: "Introdução" },
  { number: 2, key: "objective", title: "Objetivo" },
  { number: 3, key: "development", title: "Desenvolvimento" },
  { number: 4, key: "final_thoughts", title: "Considerações finais" },
  { number: 5, key: "references", title: "Referências" },
] as const;

export default function RelatorioIndexScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(isLikelyOnline());

  useEffect(() => {
    return subscribeOnlineState((online) => setIsOnline(online));
  }, []);

  const relatorioId = id ? String(id) : null;
  const { data: relatorio, isLoading, error } = useSWR(
    isOnline && relatorioId ? `relatorio-${relatorioId}` : null,
    () => getRelatorioById(relatorioId!)
  );

  if (!isOnline) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-slate-50">
          <View className="px-5">
            <HeaderStack title="Relatório" />
          </View>
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <Text className="text-base font-bold text-amber-800">Relatórios indisponíveis offline</Text>
              <Text className="mt-2 text-sm leading-6 text-amber-700">
                A visualização de relatórios só está disponível quando o dispositivo estiver conectado à internet.
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  }

  const rel = (relatorio as any)?.data ?? relatorio;
  const canteiroNome =
    rel?.canteiro?.name ??
    rel?.list?.plant?.name ??
    (relatorioId ? `Canteiro ${relatorioId}` : "Relatório");

  const status: string = rel?.status ?? "RASCUNHO";
  const emRascunho = status === "RASCUNHO";

  function handlePreviewPDF() {
    if (!relatorioId) return;
    router.push(`/relatorios/${relatorioId}/pdf`);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View className="px-6 pb-6 bg-green-900 items-center gap-2 justify-center">
          <HeaderStack title="" />
          <AppIcon name="file" size={28} color="#ffffff" />
          <Text className="text-2xl font-bold text-white text-center">Relatório de Análise do Canteiro</Text>
          <Text className="text-white text-center">{canteiroNome}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#14532d" className="mt-10" />
        ) : error || !rel ? (
          <View className="p-6">
            <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="text-center text-sm text-red-700">
                Não foi possível carregar o relatório agora. Tente novamente.
              </Text>
            </View>
          </View>
        ) : (
          <View className="p-6 gap-4">
            {!emRascunho ? (
              <View className="bg-emerald-50 rounded-2xl p-6 gap-2">
                <Text className="text-xs font-bold uppercase text-emerald-800">
                  {status === "CORRIGIDO" ? "Relatório corrigido" : "Relatório submetido"}
                </Text>

                {status === "CORRIGIDO" && rel?.grade != null ? (
                  <Text className="text-3xl font-bold text-green-900">
                    Nota {Number(rel.grade).toFixed(1)}
                  </Text>
                ) : status === "SUBMETIDO" ? (
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

            {SECTIONS.map((section) => {
              const text = String(rel?.[section.key] ?? "");
              return (
                <View
                  key={section.key}
                  className="bg-gray-50 rounded-2xl p-6 w-full gap-3"
                >
                  <View className="flex-row items-center gap-2">
                    <View
                      className="bg-gray-400 items-center justify-center"
                      style={{ width: 32, height: 32, borderRadius: 16 }}
                    >
                      <Text>{section.number}</Text>
                    </View>
                    <Text className="flex-1 text-xl font-semibold">
                      {section.title}
                    </Text>
                  </View>

                  {text.trim() ? (
                    <Text className="text-base leading-6 text-slate-700">
                      {text}
                    </Text>
                  ) : (
                    <Text className="text-sm italic text-slate-400">
                      Seção ainda não preenchida.
                    </Text>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              className="border p-6 items-center rounded-2xl"
              onPress={handlePreviewPDF}
            >
              <Text className="font-semibold">Visualizar PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
}
