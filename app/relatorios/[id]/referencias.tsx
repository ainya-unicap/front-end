import { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import useSWR from 'swr';
import StepControl from '@/components/forms/stepControll';
import Warning from '@/components/forms/warning';
import Input10 from '@/components/forms/input10';
import HeaderStack from '@/components/navigation/headerStack';
import { Skeleton } from '@/components/ui/Skeleton';
import { getRelatorioById, updateRelatorioReferences } from '@/database/relatoriosService';

export default function RelatorioReferenciasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: relatorio, isLoading } = useSWR(
    id ? `relatorio-${id}` : null,
    () => getRelatorioById(id)
  );

  const [references, setReferences] = useState('');

  useEffect(() => {
    const r = (relatorio as any)?.data ?? relatorio;
    if (r) {
      setReferences(r.references ?? '');
    }
  }, [relatorio]);

  const handleProximo = async () => {
    try {
      await updateRelatorioReferences(id, references);
      router.push(`/relatorios/${id}`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as referências agora.");
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 px-5">
        <HeaderStack title="Seção 5 — Referências Bibliográficas" />

        <Warning text="📚 Liste as fontes consultadas durante o acompanhamento. Uma por linha." />

        {isLoading ? (
          <View className="gap-4 pt-2">
            <Skeleton width="100%" height={180} radius={12} />
          </View>
        ) : (
          <Input10
            label="REFERÊNCIAS BIBLIOGRÁFICAS"
            value={references}
            onChangeText={setReferences}
          />
        )}
      </View>

      <StepControl nextStep={handleProximo} />
    </View>
  );
}
