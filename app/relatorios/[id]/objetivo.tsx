import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import StepControl from '@/components/forms/stepControll';
import Warning from '@/components/forms/warning';
import Input10 from '@/components/forms/input10';
import HeaderStack from '@/components/navigation/headerStack';

export default function RelatorioObjetivoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Estado preenchido com o texto padrão do protótipo
  const [objective, setObjective] = useState(
    "Acompanhar e registrar o desenvolvimento do Capim Massai ao longo do semestre, documentando medições semanais de altura, cobertura do solo e estádio fenológico, bem como as atividades..."
  );
  const [specificObjectives, setSpecificObjectives] = useState(''); 

  const handleProximo = () => {
    Alert.alert("Salvamento Automático", "As alterações do objetivo foram salvas!");
  };

  return (
    <View className="flex-1 bg-[#f8fafc]"> 
      {/* Remove o cabeçalho nativo do Expo */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <HeaderStack
          title="Seção 2 — Objetivo"
        />

        <Warning 
          text="✨ Texto base gerado automaticamente. Edite para personalizar os objetivos específicos."
        />

        {/* Campo Objetivo Geral */}
        <Input10
          label="OBJETIVO GERAL"
          value={objective}
          onChangeText={setObjective}
        />

        {/* Campo Objetivos Específicos */}
        <Input10
          label="OBJETIVOS ESPECÍFICOS (OPCIONAL)"
          value={specificObjectives}
          onChangeText={setSpecificObjectives}
        />
      </ScrollView>

      <StepControl
        nextStep={()=>{
          router.push(`/relatorios/${id}/desenvolvimento`);
        }}
      />
    </View>
  );
}