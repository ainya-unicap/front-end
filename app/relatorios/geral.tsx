import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function RelatorioObjetivoScreen() {
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
        <View className="flex-row items-center mb-8 mt-14">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="p-3 bg-white rounded-full border border-gray-200 shadow-sm"
          >
            <AntDesign name="left" size={16} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0f172a] ml-4">Seção 2 — Objetivo</Text>
        </View>

        <View className="flex-row items-start mb-6 border-l-[3px] border-[#166534] pl-3 ml-1">
          <Text className="text-lg mr-2">✨</Text>
          <Text className="text-gray-600 flex-1 text-[13px] leading-5">
            Texto base gerado automaticamente. Edite para personalizar os objetivos específicos.
          </Text>
        </View>

        {/* Campo Objetivo Geral */}
        <View className="mb-6">
          <Text className="text-[11px] font-bold text-gray-400 mb-2 tracking-wider">OBJETIVO GERAL</Text>
          <TextInput
            className="bg-white rounded-xl p-4 text-gray-700 text-base border border-gray-200"
            style={{ minHeight: 180, textAlignVertical: 'top' }}
            multiline
            value={objective}
            onChangeText={setObjective}
          />
        </View>

        {/* Campo Objetivos Específicos */}
        <View className="mb-10">
          <Text className="text-[11px] font-bold text-gray-400 mb-2 tracking-wider">OBJETIVOS ESPECÍFICOS (OPCIONAL)</Text>
          <TextInput
            className="bg-white rounded-xl p-4 text-gray-700 text-base border border-gray-200"
            style={{ minHeight: 120, textAlignVertical: 'top' }}
            multiline
            placeholder="Ex: Identificar as fases de crescimento..."
            placeholderTextColor="#9ca3af"
            value={specificObjectives}
            onChangeText={setSpecificObjectives}
          />
        </View>
      </ScrollView>

      {/* Barra de Navegação Inferior */}
      <View className="flex-row justify-between px-5 pb-8 pt-4 bg-[#f8fafc] border-t border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-1 bg-white py-3.5 rounded-xl mr-2 items-center border border-gray-300"
        >
          <Text className="text-gray-700 font-bold text-sm">‹ Anterior</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleProximo}
          className="flex-1 bg-[#166534] py-3.5 rounded-xl ml-2 items-center justify-center"
        >
          <Text className="text-white font-bold text-sm">Próximo ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}