import { View, Text, TouchableOpacity, FlatList, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { getRelatorios } from '@/database/relatorios';
import { Skeleton } from '@/components/ui/Skeleton';
import useSWR from 'swr';

const shadowStyle: ViewStyle = {
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
};

function getStatusStyle(status: string) {
  switch (status) {
    case 'CORRIGIDO': return 'bg-[#ede9fe]';
    case 'RASCUNHO': return 'bg-[#fef3c7]';
    case 'SUBMETIDO': return 'bg-[#dcfce3]';
    default: return 'bg-gray-100';
  }
}

export default function ListaRelatoriosScreen() {
  const router = useRouter();

  const { data, error, isLoading } = useSWR('relatorios', getRelatorios);
  const relatorios: any[] = Array.isArray(data)
    ? data
    : ((data as any)?.data ?? []);

  const renderItem = ({ item }: { item: any }) => {
    const planta =
      item.list?.plant?.name ?? item.canteiro?.name ?? 'Relatório';
    const periodo =
      item.academic_period?.name ??
      (item.createdAt
        ? new Date(item.createdAt).toLocaleDateString('pt-BR')
        : '');
    const status: string = item.status ?? 'RASCUNHO';
    const registros = `${item._count?.formularios ?? item.formularios?.length ?? 0} registros`;

    return (
      <TouchableOpacity
        className="bg-white p-5 rounded-[24px] mb-4 border border-gray-100"
        style={shadowStyle}
        onPress={() => router.push(`/relatorios/${item.id}` as any)}
      >
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-lg font-bold text-[#0f172a]">{planta}</Text>
          <View className={`px-2 py-1 rounded-md ${getStatusStyle(status)}`}>
            <Text className="text-[10px] font-bold uppercase">{status}</Text>
          </View>
        </View>

        <Text className="text-sm text-gray-400 mb-4">{registros}</Text>

        <View className="flex-row justify-between items-center border-t border-gray-100 pt-4 mt-1">
          <View className="flex-row items-center">
            <Text className="mr-2 text-base">📅</Text>
            <Text className="text-gray-400 text-sm font-medium">{periodo}</Text>
          </View>

          {status === 'CORRIGIDO' && item.grade != null ? (
            <Text className="text-[#166534] font-bold text-xl">
              {Number(item.grade).toFixed(1)}
            </Text>
          ) : status === 'RASCUNHO' ? (
            <Text className="text-[#166534] font-bold text-sm bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
              Continuar
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafc] px-5 pt-14 pb-[100px]">
      <View className="flex-row justify-between items-end mb-6">
        <Text className="text-2xl font-bold text-[#0f172a]">Meus Relatórios</Text>
        <Text className="text-gray-400 text-sm mb-1 font-medium">
          {relatorios.length} relatórios
        </Text>
      </View>

      {isLoading ? (
        <View className="gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={140} radius={24} />
          ))}
        </View>
      ) : error ? (
        <Text className="text-center text-red-600 mt-10">
          Erro ao carregar relatórios.
        </Text>
      ) : (
        <FlatList
          data={relatorios}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">
              Você ainda não tem relatórios.
            </Text>
          }
        />
      )}

      <TouchableOpacity
        className="mt-2 bg-white border border-[#166534] py-[14px] rounded-full flex-row justify-center items-center shadow-sm"
        onPress={() => router.push('/relatorios/novo')}
      >
        <AntDesign name="plus" size={18} color="#5b21b6" />
        <Text className="text-[#166534] font-bold text-base ml-2">Novo relatório</Text>
      </TouchableOpacity>
    </View>
  );
}
