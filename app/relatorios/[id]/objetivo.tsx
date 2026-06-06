import { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import useSWR from 'swr';
import StepControl from '@/components/forms/stepControll';
import Warning from '@/components/forms/warning';
import Input10 from '@/components/forms/input10';
import HeaderStack from '@/components/navigation/headerStack';
import { Skeleton } from '@/components/ui/Skeleton';
import { getRelatorioById, updateRelatorioObjective } from '@/database/relatoriosService';

export default function RelatorioObjetivoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: relatorio, isLoading } = useSWR(
    id ? `relatorio-${id}` : null,
    () => getRelatorioById(id)
  );

  const [objective, setObjective] = useState('');
  const [specificObjectives, setSpecificObjectives] = useState('');

  // Preenche os campos com o texto já salvo no relatório
  useEffect(() => {
    const r = (relatorio as any)?.data ?? relatorio;
    if (r) {
      setObjective(r.objective ?? '');
      setSpecificObjectives(r.specific_objectives ?? '');
    }
  }, [relatorio]);

  // Salva o objetivo no relatório e avança para a próxima seção
  const handleProximo = async () => {
    try {
      await updateRelatorioObjective(id, objective);
      router.push(`/relatorios/${id}/desenvolvimento`);
    } catch (error) {
      console.error("Erro ao salvar objetivo:", error);
      Alert.alert("Erro", "Não foi possível salvar o objetivo agora.");
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Remove o cabeçalho nativo do Expo */}
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 px-5">
        <HeaderStack title="Seção 2 — Objetivo" />

        <Warning text="✨ Texto base gerado automaticamente. Edite para personalizar os objetivos específicos." />

        {isLoading ? (
          <View className="gap-4 pt-2">
            <Skeleton width="100%" height={120} radius={12} />
            <Skeleton width="100%" height={120} radius={12} />
          </View>
        ) : (
          <>
            <Input10
              label="OBJETIVO GERAL"
              value={objective}
              onChangeText={setObjective}
            />

            <Input10
              label="OBJETIVOS ESPECÍFICOS (OPCIONAL)"
              value={specificObjectives}
              onChangeText={setSpecificObjectives}
            />
          </>
        )}
      </View>

      <StepControl nextStep={handleProximo} />
    </View>
  );
}
