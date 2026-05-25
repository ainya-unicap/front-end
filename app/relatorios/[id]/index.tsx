import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
        <ScrollView>
            <View className="p-6 bg-green-900 items-center gap-2">
                <Text>📄</Text>
                <Text className="text-2xl font-bold text-white">Relatório de Análise do Canteiro</Text>
                <Text className="text-white">Canteiro { id }</Text>
            </View> 
            <View className="p-6 gap-4">
                <View className="bg-gray-50 rounded-2xl p-6 w-full gap-8">
                    <View className="flex-row justify-between w-full gap-2 items-center h-fit">
                        <View className="bg-gray-400 text-white items-center justify-center"
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        >
                            <Text>1</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-semibold">Introdução</Text>
                            <Text className="text-sm">Contexto e justificativa</Text>
                        </View>
                        <Text>✏️</Text>
                    </View>

                    <View className="flex-row justify-between w-full gap-2 items-center h-fit">
                        <View className="bg-gray-400 text-white items-center justify-center"
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        >
                            <Text>2</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-semibold">Objetivo</Text>
                            <Text className="text-sm">Objetivos do acompanhamento</Text>
                        </View>
                        <Text>✏️</Text>
                    </View>

                    <View className="flex-row justify-between w-full gap-2 items-center h-fit">
                        <View className="bg-gray-400 text-white items-center justify-center"
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        >
                            <Text>3</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-semibold">Desenvolvimento</Text>
                            <Text className="text-sm">12 registros organizados</Text>
                        </View>
                        <Text>✏️</Text>
                    </View>

                    <View className="flex-row justify-between w-full gap-2 items-center h-fit">
                        <View className="bg-gray-400 text-white items-center justify-center"
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        >
                            <Text>4</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-semibold">Considerações finais</Text>
                            <Text className="text-sm">Conclusões e aprendizados</Text>
                        </View>
                        <Text>✏️</Text>
                    </View>

                    <View className="flex-row justify-between w-full gap-2 items-center h-fit">
                        <View className="bg-gray-400 text-white items-center justify-center"
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        >
                            <Text>5</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-semibold">Referências</Text>
                            <Text className="text-sm">Fontes consultadas</Text>
                        </View>
                        <Text>✏️</Text>
                    </View>
                </View>
                <TouchableOpacity className="border p-6 items-center rounded-2xl">
                    <Text className="font-semibold">Pré-visualizar PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-green-900 p-6 items-center rounded-2xl">
                    <Text className="text-white font-semibold">Submeter Relatório</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </>
  );
}