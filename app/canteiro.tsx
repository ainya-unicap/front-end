import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type Canteiro = {
    id: string;
    planta: string;
    categoria: string;
    periodo: string;
    status: "ATIVO" | "INATIVO";
    progresso: number;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

/*
 * Pessoal, os dados do canteiro vindo do backend podem ficar aqui
 * Deixei vazio por enquanto
 * 
 * const { data: canteiros } = useSWR(
 *   "user-canteiros",
 *   getCanteiros
 * ); 
 *  */

const CANTEIROS: Canteiro[] = [];

function CanteiroCard({ canteiro }: { canteiro: Canteiro }) {
    return (
        <Pressable
            className="mb-4 rounded-2xl bg-white p-4 shadow-sm active:opacity-80"
            onPress={() =>
                router.push({
                    pathname: "/canteiros/[id]",
                    params: {
                        id: canteiro.id,
                        name: canteiro.planta,
                    },
                })
            }
        >
            <View className="flex-row items-start">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                    <MaterialCommunityIcons
                        name={canteiro.icon}
                        size={27}
                        color="#166534"
                    />
                </View>

                <View className="ml-3 flex-1">
                    <View className="flex-row items-center justify-between">
                        <Text
                            className="flex-1 text-base font-bold text-slate-900"
                            numberOfLines={1}
                        >
                            {canteiro.planta}
                        </Text>

                        <View className="ml-2 flex-row items-center rounded-full bg-emerald-100 px-2.5 py-1">
                            <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />

                            <Text className="text-[10px] font-bold text-emerald-700">
                                {canteiro.status}
                            </Text>
                        </View>
                    </View>

                    <Text className="mt-1 text-sm text-slate-500">
                        {canteiro.categoria}
                    </Text>

                    <View className="mt-3 flex-row items-center justify-between">
                        <Text className="text-xs font-medium text-slate-400">
                            Período {canteiro.periodo}
                        </Text>

                        <Text className="text-xs font-bold text-emerald-700">
                            {canteiro.progresso}%
                        </Text>
                    </View>

                    <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <View
                            className="h-full rounded-full bg-emerald-700"
                            style={{ width: `${canteiro.progresso}%` }}
                        />
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

export default function CanteiroScreen() {
    const hasCanteiros = CANTEIROS.length > 0;

    return (
        <View className="flex-1 bg-slate-50">
            <View className="px-5 pb-5 pt-14">
                <View className="flex-row items-center justify-between">
                    <Text className="text-2xl font-bold text-slate-950">
                        Meu Canteiro
                    </Text>

                    {/* Não removi por completo melhor só comentar...
                    
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                        <MaterialCommunityIcons
                            name="sprout"
                            size={24}
                            color="#166534"
                        />
                    </View> */}

                </View>
            </View>

            <ScrollView
                className="flex-1 px-5"
                contentContainerClassName="pb-32"
                showsVerticalScrollIndicator={false}
            >
                {hasCanteiros ? ( /* Quando o backend estiver conectado o canteiro vai aparecer aqui. */
                    CANTEIROS.map((canteiro) => (
                        <CanteiroCard key={canteiro.id} canteiro={canteiro} />
                    ))
                ) : (

                    /* Mensagem quando está vazio */
                    <View className="items-center rounded-2xl bg-white px-6 py-12 shadow-sm">
                        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                            <MaterialCommunityIcons
                                name="sprout-outline"
                                size={32}
                                color="#166534" />
                        </View>

                        <Text className="text-center text-base font-bold text-slate-800">
                            Nenhum canteiro cadastrado
                        </Text>

                        <Text className="mt-2 text-center text-sm text-slate-400">
                            Cadastre o seu canteiro para começar a acompanhar a sua planta.
                        </Text>
                    </View>
                )}

                <Pressable
                    className="mt-4 flex-row items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 py-4 active:opacity-70"
                    onPress={() => router.push("/nova-lista")}
                >
                    <Ionicons name="add-circle-outline" size={21} color="#166534" />

                    <Text className="ml-2 text-sm font-bold text-emerald-800">
                        Cadastrar Canteiro
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}