import { Text, View, TouchableOpacity } from "react-native";
import Input1 from "./input1";
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

export default function FormLogin() {
    const router = useRouter();
    return (
        <View className="bg-white w-full rounded-t-3xl p-8">
            <Text className="text-2xl font-semibold border-b border-gray-400 mb-6">Entrar</Text>
            <Input1 label="Email" placeholder="Digite seu email" />
            <Input1 label="Senha" placeholder="Digite sua senha" />
            <TouchableOpacity className="bg-green-700 rounded-lg py-4 mt-4"
                onPress={() => {
                    router.push("/(tabs)")
                }}
            >
                <Text className="text-white text-center font-semibold">Entrar</Text>
            </TouchableOpacity>
            <Text className="text-center mt-4">Ainda não possui uma conta? <Link href="/cadastro"><Text className="text-green-700 font-semibold">Cadastrar</Text></Link></Text>
        </View>
    )
}