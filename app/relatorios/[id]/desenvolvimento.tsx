import StepControl from "@/components/forms/stepControll";
import Warning from "@/components/forms/warning";
import HeaderStack from "@/components/navigation/headerStack";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";

export default function UserScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <>
            <ScrollView>
                
                <View className="p-6 pt-0 gap-4 bg-[#f8fafc]">
                    <HeaderStack title="Seção 3 — Desenvolvimento" />
                    <Warning
                        text="📋 Gerado automaticamente dos seus registros. Edite o texto de cada semana se desejar."
                    />
                    <View className="gap-2 border border-gray-200 rounded-xl p-4">
                        <Text className="text-lg font-bold text-gray-400 mb-2 tracking-wider">Semana 1</Text>
                        <View className="flex-row gap-2">
                            <View className="border border-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">45cm</Text>
                                <Text className="text-sm">Altura</Text>
                            </View>

                            <View className="border border-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">72%</Text>
                                <Text className="text-sm">Cobertura</Text>
                            </View>

                            <View className="border border-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">Veg.</Text>
                                <Text className="text-sm">Estação</Text>
                            </View>
                        </View>

                        <Image
                            source={require('@/assets/images/planta.jpeg')}
                            style={{ width: '100%', height: 200, borderRadius: 16 }}
                        />
                        {/*Text area */}
                        <TextInput
                            multiline
                            numberOfLines={4}
                            className="bg-white rounded-xl p-4 text-gray-700 text-base border border-gray-200"
                            value="Crescimento uniforme. Solo com boa umidade. Sem sinais de pragas."
                        />
                    </View>

                    <View className="gap-2 border border-gray-200 rounded-xl p-4">
                        <Text className="text-lg font-bold text-gray-400 mb-2 tracking-wider">Semana 2</Text>
                        <View className="flex-row gap-2">
                            <View className="border border-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">45cm</Text>
                                <Text className="text-sm">Altura</Text>
                            </View>

                            <View className="border border-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">72%</Text>
                                <Text className="text-sm">Cobertura</Text>
                            </View>

                            <View className="border border-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">Veg.</Text>
                                <Text className="text-sm">Estação</Text>
                            </View>
                        </View>

                        <Image
                            source={require('@/assets/images/planta.jpeg')}
                            style={{ width: '100%', height: 200, borderRadius: 16 }}
                        />
                        {/*Text area */}
                        <TextInput
                            multiline
                            numberOfLines={4}
                            className="bg-white rounded-xl p-4 text-gray-700 text-base border border-gray-200"
                            value="Crescimento uniforme. Solo com boa umidade. Sem sinais de pragas."
                        />


                    </View>


                </View>
            </ScrollView>
            <StepControl nextStep={() => { }} />
        </>
    );
}