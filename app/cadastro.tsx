import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input1 from '@/components/forms/input1';
import { useState } from 'react';

export default function Cadastro() {
    const [role, setRole] = useState<'aluno' | 'professor' | null>('aluno');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [instituicao, setInstituicao] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    return (
        <>
            <StatusBar style="dark" />
            <ScrollView>
                <View className='p-6 bg-gray-50 min-h-screen'>
                    <View>
                        <Text>Você é</Text>
                        <View className='flex-row gap-4'>
                            <TouchableOpacity className={`items-center flex-1 py-10 rounded-2xl bg-gray-100 ${role === 'aluno' ? 'border border-green-700' : ''}`}
                                onPress={() => {
                                    setRole('aluno');
                                }}
                            >
                                <Text>🎓</Text>
                                <Text>Aluno</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className={`items-center flex-1 py-10 rounded-2xl bg-gray-100 ${role === 'professor' ? 'border border-green-700' : ''}`}
                                onPress={() => {
                                    setRole('professor');
                                }}
                            >
                                <Text>🧑‍🏫</Text>
                                <Text>Professor</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <Input1 label="Nome" placeholder="Digite seu nome" value={name} onChangeText={setName} />
                        <Input1 label="Email" placeholder="Digite seu email" value={email} onChangeText={setEmail} />
                        <Input1 label="Instituicao" placeholder="Digite sua instituicao" value={instituicao} onChangeText={setInstituicao} />
                        <Input1 label="Senha" placeholder="Digite sua senha" value={senha} onChangeText={setSenha} />
                        <Input1 label="Confirmar Senha" placeholder="Confirme sua senha" value={confirmarSenha} onChangeText={setConfirmarSenha} />
                    </View>
                    <TouchableOpacity className="bg-green-700 rounded-lg py-4 mt-4">
                        <Text className="text-white text-center font-semibold">Cadastrar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    )
}