import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input1 from '@/components/forms/input1';

export default function Cadastro() {
    return (
        <>
            <StatusBar style="dark" />
            <ScrollView>
                <View className='p-6'>
                    <View>
                        <Text>Você é</Text>
                    </View>
                    <View>
                        <Input1 label="Nome" placeholder="Digite seu nome" />
                        <Input1 label="Email" placeholder="Digite seu email" />
                        <Input1 label="Instituicao" placeholder="Digite sua instituicao" />
                        <Input1 label="Senha" placeholder="Digite sua senha" />
                        <Input1 label="Confirmar Senha" placeholder="Confirme sua senha" />
                    </View>
                    <TouchableOpacity className="bg-green-700 rounded-lg py-4 mt-4">
                        <Text className="text-white text-center font-semibold">Cadastrar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    )
}