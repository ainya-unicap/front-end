import { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import useSWR from 'swr';
import StepControl from '@/components/forms/stepControll';
import Warning from '@/components/forms/warning';
import Input10 from '@/components/forms/input10';
import HeaderStack from '@/components/navigation/headerStack';
import { Skeleton } from '@/components/ui/Skeleton';
import { getRelatorioById, updateRelatorioIntroduction } from '@/database/relatoriosService';

export default function RelatorioIntroducaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: relatorio, isLoading } = useSWR(
    id ? `relatorio-${id}` : null,
    () => getRelatorioById(id)
  );

  const [introduction, setIntroduction] = useState('');

  useEffect(() => {
    const r = (relatorio as any)?.data ?? relatorio;
    if (r) {
      setIntroduction(r.introduction ?? '');
    }
  }, [relatorio]);

  const handleProximo = async () => {
    try {
      await updateRelatorioIntroduction(id, introduction);
      router.push(`/relatorios/${id}/objetivo`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a introdução agora.");
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 px-5">
        <HeaderStack title="Seção 1 — Introdução" />

        <Warning text="✨ Texto base gerado automaticamente. Edite para personalizar o contexto e a justificativa." />

        {isLoading ? (
          <View className="gap-4 pt-2">
            <Skeleton width="100%" height={180} radius={12} />
          </View>
        ) : (
          <Input10
            label="INTRODUÇÃO"
            value={introduction}
            onChangeText={setIntroduction}
          />
        )}
      </View>

      <StepControl nextStep={handleProximo} />
    </View>
  );
}
