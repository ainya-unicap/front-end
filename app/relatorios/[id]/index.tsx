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
import { AppIcon } from "@/components/ui/AppIcon";

const SECTIONS = [
  { number: 1, key: 'introduction', title: 'Introdução' },
  { number: 2, key: 'objective', title: 'Objetivo' },
  { number: 3, key: 'development', title: 'Desenvolvimento' },
  { number: 4, key: 'final_thoughts', title: 'Considerações finais' },
  { number: 5, key: 'references', title: 'Referências' },
] as const;

export default function RelatorioIndexScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: relatorio, isLoading } = useSWR(
    id ? `relatorio-${id}` : null,
    () => getRelatorioById(id)
  );

  const rel = (relatorio as any)?.data ?? relatorio;
  const canteiroNome =
    rel?.canteiro?.name ??
    rel?.list?.plant?.name ??
    `Canteiro ${id}`;

  const status: string = rel?.status ?? 'RASCUNHO';
  const emRascunho = status === 'RASCUNHO';

  function handlePreviewPDF() {
    router.push(`/relatorios/${id}/pdf`);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View className="px-6 pb-6 bg-green-900 items-center gap-2 justify-center">
          <HeaderStack title="" />
          <AppIcon name="file" size={28} color="#ffffff" />
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

            {SECTIONS.map((section) => {
              const text: string = rel?.[section.key] ?? '';
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
