import { Text, View, TouchableOpacity } from "react-native";
import Input1 from "./input1";
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { login } from "@/database/auth";
import { Alert } from "react-native";
import { useState } from "react";

export default function FormLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    async function handleLogin() {
        const result: { status: number, data: string } = await login({
            email,
            senha
        });

        Alert.alert(
            result.status === 200 ? "Login Realizado" : "Erro ao logar",
            typeof result.data === "string" ? result.data : JSON.stringify(result.data)
        );

        if (result.status === 200) {
            router.push("/(tabs)");
        }

    }
    return (
        <View className="bg-white w-full rounded-t-3xl p-8">
            <Text className="text-2xl font-semibold border-b border-gray-400 mb-6">Entrar</Text>
            <Input1 label="Email" placeholder="Digite seu email" value={email} onChangeText={setEmail} />
            <Input1 label="Senha" placeholder="Digite sua senha" value={senha} onChangeText={setSenha} />
            <TouchableOpacity className="bg-green-700 rounded-lg py-4 mt-4"
                onPress={() => {
                    handleLogin();
                }}
            >
                <Text className="text-white text-center font-semibold">Entrar</Text>
            </TouchableOpacity>
            <Text className="text-center mt-4 mb-6">Ainda não possui uma conta? <Link href="/cadastro"><Text className="text-green-700 font-semibold">Cadastrar</Text></Link></Text>
        </View>
    )
}