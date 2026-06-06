import { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import useSWR from 'swr';
import StepControl from '@/components/forms/stepControll';
import Warning from '@/components/forms/warning';
import Input10 from '@/components/forms/input10';
import HeaderStack from '@/components/navigation/headerStack';
import { Skeleton } from '@/components/ui/Skeleton';
import { getRelatorioById, updateRelatorioFinalThoughts } from '@/database/relatoriosService';

export default function RelatorioConsideracoesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: relatorio, isLoading } = useSWR(
    id ? `relatorio-${id}` : null,
    () => getRelatorioById(id)
  );

  const [finalThoughts, setFinalThoughts] = useState('');

  useEffect(() => {
    const r = (relatorio as any)?.data ?? relatorio;
    if (r) {
      setFinalThoughts(r.final_thoughts ?? '');
    }
  }, [relatorio]);

  const handleProximo = async () => {
    try {
      await updateRelatorioFinalThoughts(id, finalThoughts);
      router.push(`/relatorios/${id}/referencias`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as considerações agora.");
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 px-5">
        <HeaderStack title="Seção 4 — Considerações Finais" />

        <Warning text="✨ Texto base gerado automaticamente. Edite para personalizar suas conclusões e aprendizados." />

        {isLoading ? (
          <View className="gap-4 pt-2">
            <Skeleton width="100%" height={180} radius={12} />
          </View>
        ) : (
          <Input10
            label="CONSIDERAÇÕES FINAIS"
            value={finalThoughts}
            onChangeText={setFinalThoughts}
          />
        )}
      </View>

      <StepControl nextStep={handleProximo} />
    </View>
  );
}
