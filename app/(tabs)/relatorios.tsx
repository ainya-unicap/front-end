import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

type Relatorio = {
  id: string;
  planta: string;
  periodo: string;
  registros: string;
  status: 'RASCUNHO' | 'SUBMETIDO' | 'CORRIGIDO';
  grade?: number;
};

export default function ListaRelatoriosScreen() {
  const router = useRouter();

  const [relatorios] = useState<Relatorio[]>([
    { id: '1', planta: 'Capim Massai', periodo: '2026.1 · 1º Sem.', registros: '12 registros · Submetido 07/04', status: 'CORRIGIDO', grade: 9.0 },
    { id: '2', planta: 'Braquiária', periodo: '2026.1 · 1º Sem.', registros: '8 registros · Rascunho em edição', status: 'RASCUNHO' },
    { id: '3', planta: 'Estilosantes', periodo: '2025.2 · 2º Sem.', registros: '10 registros · Período anterior', status: 'CORRIGIDO', grade: 8.5 },
  ]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CORRIGIDO': return 'bg-[#ede9fe] text-[#5b21b6]'; 
      case 'RASCUNHO': return 'bg-[#fef3c7] text-[#d97706]'; 
      case 'SUBMETIDO': return 'bg-[#dcfce3] text-[#166534]'; 
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const shadowStyle: ViewStyle = {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 }
  };

  const renderItem = ({ item }: { item: Relatorio }) => (
    <TouchableOpacity 
      className="bg-white p-5 rounded-[24px] mb-4 border border-gray-100"
      style={shadowStyle}
      onPress={() => router.push(`/relatorios/${item.id}` as any)}
    >
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-lg font-bold text-[#0f172a]">
          {item.planta} — {item.periodo.split(' ')[0]}
        </Text>
        <View className={`px-2 py-1 rounded-md ${getStatusStyle(item.status)}`}>
          <Text className="text-[10px] font-bold uppercase">{item.status}</Text>
        </View>
      </View>
      
      <Text className="text-sm text-gray-400 mb-4">{item.registros}</Text>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-4 mt-1">
        <View className="flex-row items-center">
           <Text className="mr-2 text-base">📅</Text>
           <Text className="text-gray-400 text-sm font-medium">{item.periodo}</Text>
        </View>
        
        {item.status === 'CORRIGIDO' ? (
          <Text className="text-[#166534] font-bold text-xl">{item.grade?.toFixed(1)}</Text>
        ) : item.status === 'RASCUNHO' ? (
          <Text className="text-[#166534] font-bold text-sm bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
            Continuar
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (

    <View className="flex-1 bg-[#f8fafc] px-5 pt-14 pb-[100px]">
      <View className="flex-row justify-between items-end mb-6">
        <Text className="text-2xl font-bold text-[#0f172a]">Meus Relatórios</Text>
        <Text className="text-gray-400 text-sm mb-1 font-medium">{relatorios.length} relatórios</Text>
      </View>
      
      <FlatList
        data={relatorios}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity 
        className="mt-2 bg-white border border-[#166534] py-[14px] rounded-full flex-row justify-center items-center shadow-sm"
        onPress={() => router.push('/relatorios/novo' as any)}
      >
        <AntDesign name="plus" size={18} color="#5b21b6" />
        <Text className="text-[#166534] font-bold text-base ml-2">Novo relatório</Text>
      </TouchableOpacity>
    </View>
  );
}