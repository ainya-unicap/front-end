import StepControl from "@/components/forms/stepControll";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";

export default function UserScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <>
            
            <ScrollView>
                <View className="p-6 gap-4">
                    <View className="border-l-2 pl-4 py-3 border-green-900 bg-gray-200">
                        <Text>
                            📋 Gerado automaticamente dos seus registros. Edite o texto de cada semana se desejar.
                        </Text>
                    </View>
                    <View className="gap-2">
                        <Text className="text-lg font-semibold">Semana 1</Text>
                        <View className="flex-row gap-2">
                            <View className="bg-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">45cm</Text>
                                <Text className="text-sm">Altura</Text>
                            </View>

                            <View className="bg-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">72%</Text>
                                <Text className="text-sm">Cobertura</Text>
                            </View>

                            <View className="bg-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">Veg.</Text>
                                <Text className="text-sm">Estação</Text>
                            </View>
                        </View>

                        <Image
                            source={require('@/assets/images/planta.jpeg')}
                            style={{ width: '100%', height: 200, borderRadius: 16 }}
                        />
                        {/*Text area */}
                        <View className="bg-gray-200 rounded-xl p-4">
                            <TextInput
                                multiline
                                numberOfLines={4}
                                className="text-md"
                                value="Crescimento uniforme. Solo com boa umidade. Sem sinais de pragas."
                            />
                        </View>
                    </View>

                    <View className="gap-2">
                        <Text className="text-lg font-semibold">Semana 2</Text>
                        <View className="flex-row gap-2">
                            <View className="bg-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">45cm</Text>
                                <Text className="text-sm">Altura</Text>
                            </View>

                            <View className="bg-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">72%</Text>
                                <Text className="text-sm">Cobertura</Text>
                            </View>

                            <View className="bg-gray-200 rounded-xl px-4 py-2">
                                <Text className="text-lg font-semibold">Veg.</Text>
                                <Text className="text-sm">Estação</Text>
                            </View>
                        </View>

                        <Image
                            source={require('@/assets/images/planta.jpeg')}
                            style={{ width: '100%', height: 200, borderRadius: 16 }}
                        />
                        {/*Text area */}
                        <View className="bg-gray-200 rounded-xl p-4">
                            <TextInput
                                multiline
                                numberOfLines={4}
                                className="text-md"
                                value="Crescimento uniforme. Solo com boa umidade. Sem sinais de pragas."
                            />
                        </View>
                    </View>

                    
                </View>
            </ScrollView>
            <StepControl nextStep={() => {}} />
        </>
    );
}