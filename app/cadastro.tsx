import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input1 from '@/components/forms/input1';
import { useEffect, useState } from 'react';
//react-native-dropdown-picker
import DropDownPicker from 'react-native-dropdown-picker';
import useSWR from 'swr';
import { getInstitutions } from '@/database/institutions';
import { cadastro, saveAccessToken } from '@/database/auth';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Cadastro() {
    const router = useRouter();
    const [role, setRole] = useState<'aluno' | 'professor' | null>('aluno');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [instituicao, setInstituicao] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');


    const { data: instituicoes, error: instituicoesError, isLoading } = useSWR('/institutions', () => getInstitutions());

    const [open, setOpen] = useState(false);
    const [instituicaoItems, setInstituicaoItems] = useState<{ label: string, value: string }[]>([]);
    const [instituicaoValue, setInstituicaoValue] = useState<string | null>(null);

    useEffect(() => {
        if (instituicoes) {
            setInstituicaoItems(
                instituicoes.map((inst: any) => ({ label: inst.name, value: inst.id }))
            );
        }
    }, [instituicoes]);

    const handleCadastro = async () => {
        try {
            if (senha !== confirmarSenha) {
                Alert.alert('Senhas Diferentes', 'As senhas digitadas devem ser iguais.');
                return;
            }
            const response = await cadastro({ role, name, email, instituicao: instituicaoValue, senha });
            Alert.alert('Cadastro Realizado', 'Cadastro realizado com sucesso!');
            router.push('/login');
        } catch (error) {
            console.error('Error during registration:', error);
            Alert.alert('Erro ao cadastrar', 'Ocorreu um erro ao cadastrar o aluno.');
        }
    }

    return (
        <>
            <StatusBar style="dark" />
            <SafeAreaView className='p-6 bg-gray-50 min-h-screen'>
                <View>
                    <Text className='text-md font-semibold text-black/70'>Você é</Text>
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

                    <View>
                        <Text className='text-md font-semibold text-black/70'>Instituição</Text>
                        <DropDownPicker
                            open={open}
                            value={instituicaoValue}
                            items={instituicaoItems}
                            setOpen={setOpen}
                            setValue={setInstituicaoValue}
                            setItems={setInstituicaoItems}
                            placeholder="Selecione uma opção"
                            style={{ backgroundColor: '#F3F4F6', borderRadius: 8, marginTop: 4, marginBottom: 16 }}
                        />
                    </View>

                    <Input1 label="Senha" placeholder="Digite sua senha" value={senha} onChangeText={setSenha} />
                    <Input1 label="Confirmar Senha" placeholder="Confirme sua senha" value={confirmarSenha} onChangeText={setConfirmarSenha} />
                </View>
                <TouchableOpacity className="bg-green-700 rounded-lg py-4 mt-4" onPress={handleCadastro}>
                    <Text className="text-white text-center font-semibold">Cadastrar</Text>
                </TouchableOpacity>
                <Text>{isLoading ? 'Carregando instituicoes...' : ''}</Text>
                <Text>{instituicoesError ? 'Erro ao carregar instituicoes' : ''}</Text>
            </SafeAreaView>
        </>
    )
}