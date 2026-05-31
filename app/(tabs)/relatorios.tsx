import { View, Text, TouchableOpacity, FlatList, ViewStyle, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { getRelatorios } from '@/database/relatorios';
import useSWR from 'swr';

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

  const { data: relatorios, error, isLoading, mutate } = useSWR('relatorios', getRelatorios, {
    revalidateOnFocus: true,
    dedupingInterval: 0,
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CORRIGIDO': return 'bg-[#ede9fe] text-[#5b21b6]'; 
      case 'RASCUNHO': return 'bg-[#fef3c7] text-[#d97706]'; 
      case 'SUBMETIDO': return 'bg-[#dcfce3] text-[#166534]'; 
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CORRIGIDO': return 'check-circle';
      case 'RASCUNHO': return 'file-document-edit';
      case 'SUBMETIDO': return 'cloud-check';
      default: return 'file-document';
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
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold text-[#0f172a]">
            {item.planta} — {item.periodo.split(' ')[0]}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-md ${getStatusStyle(item.status)}`}>
          <Text className="text-[10px] font-bold uppercase">{item.status}</Text>
        </View>
      </View>
      
      <Text className="text-sm text-gray-400 mb-4">{item.registros}</Text>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-4">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name={getStatusIcon(item.status)} size={16} color="#6b7280" />
          <Text className="text-gray-400 text-sm font-medium ml-2">{item.periodo}</Text>
        </View>
        
        {item.status === 'CORRIGIDO' && item.grade ? (
          <Text className="text-[#166534] font-bold text-xl">{item.grade.toFixed(1)}</Text>
        ) : item.status === 'RASCUNHO' ? (
          <Text className="text-[#d97706] font-bold text-sm bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
            Continuar
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-12">
      <MaterialCommunityIcons name="file-document-outline" size={48} color="#cbd5e1" />
      <Text className="text-slate-400 text-center mt-4 text-base">Nenhum relatório cadastrado</Text>
      <Text className="text-slate-300 text-center mt-2 text-sm">Crie seu primeiro relatório para começar</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row justify-between items-end mb-6">
          <Text className="text-2xl font-bold text-[#0f172a]">Meus Relatórios</Text>
          {!isLoading && relatorios && (
            <Text className="text-gray-400 text-sm font-medium">{relatorios.length} relatórios</Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#166534" />
          <Text className="text-slate-400 mt-3">Carregando relatórios...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-5">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-red-600 text-center mt-4 text-base font-semibold">Erro ao carregar</Text>
          <Text className="text-slate-400 text-center mt-2 text-sm">Tente recarregar a página</Text>
          <TouchableOpacity
            className="mt-6 bg-red-50 border border-red-200 px-6 py-3 rounded-lg"
            onPress={() => mutate()}
          >
            <Text className="text-red-600 font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={relatorios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        />
      )}

      <View className="absolute bottom-6 left-5 right-5">
        <TouchableOpacity 
          className="bg-[#166534] border border-[#166534] py-[14px] rounded-full flex-row justify-center items-center shadow-sm active:opacity-80"
          onPress={() => router.push('/relatorios/novo')}
        >
          <AntDesign name="plus" size={18} color="white" />
          <Text className="text-white font-bold text-base ml-2">Novo relatório</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}