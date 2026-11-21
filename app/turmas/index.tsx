import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import useSWR from "swr";

import HeaderStack from "@/components/navigation/headerStack";
import { StatusBadge } from "@/components/canteiros/StatusBadge";
import { EntrarComCodigoModal } from "@/components/turmas/EntrarComCodigoModal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { AppIcon } from "@/components/ui/AppIcon";
import { getMinhasTurmas, type MinhaTurma } from "@/database/turmas";

function descricaoDaTurma(turma: MinhaTurma) {
  return [turma.period?.name, turma.institution?.name].filter(Boolean).join(" · ");
}

export default function MinhasTurmasScreen() {
  const { data: turmas, error, isLoading } = useSWR("minhas-turmas", getMinhasTurmas);
  const [modalAberto, setModalAberto] = useState(false);

  const lista: MinhaTurma[] = turmas ?? [];

  function handleEntrou(turmaNome: string) {
    setModalAberto(false);
    Alert.alert("Pronto!", `Você entrou na turma ${turmaNome}.`);
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <HeaderStack title="Minhas turmas" />

        <Text className="mb-5 text-sm leading-5 text-slate-400">
          Escolha a turma para enviar o seu relatório em PDF para a professora.
        </Text>

        {isLoading ? (
          <View key="carregando" className="gap-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} width="100%" height={84} radius={16} />
            ))}
          </View>
        ) : error ? (
          <Text key="erro" className="py-10 text-center text-red-600">
            Não foi possível carregar suas turmas.
          </Text>
        ) : lista.length === 0 ? (
          <View
            key="vazio"
            className="items-center rounded-2xl bg-white px-6 py-10 shadow-sm"
          >
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <AppIcon name="users" size={28} color="#166534" />
            </View>
            <Text className="text-center text-base font-bold text-slate-800">
              Você ainda não está em nenhuma turma
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-400">
              Peça o código à sua professora e entre na turma para enviar seu relatório.
            </Text>
          </View>
        ) : (
          lista.map((turma) => (
            <Pressable
              key={turma.id}
              accessibilityRole="button"
              accessibilityLabel={`Turma ${turma.name}`}
              onPress={() =>
                router.push({ pathname: "/turmas/[id]", params: { id: turma.id } } as any)
              }
              className="mb-3 flex-row items-center rounded-2xl bg-white p-4 shadow-sm active:opacity-80"
            >
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <AppIcon name="users" size={26} color="#166534" />
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                  {turma.name}
                </Text>
                {descricaoDaTurma(turma) ? (
                  <Text className="mt-0.5 text-sm text-slate-400" numberOfLines={1}>
                    {descricaoDaTurma(turma)}
                  </Text>
                ) : null}
                <View className="mt-2 flex-row">
                  {turma.entrega ? (
                    <StatusBadge label="RELATÓRIO ENTREGUE" variant="green" />
                  ) : (
                    <StatusBadge label="SEM ENTREGA" variant="gray" />
                  )}
                </View>
              </View>

              <Text className="text-xl text-slate-300">›</Text>
            </Pressable>
          ))
        )}

        <View className="mt-4">
          <Button
            label="Entrar com código"
            variant="ghost"
            onPress={() => setModalAberto(true)}
          />
        </View>
      </ScrollView>

      <EntrarComCodigoModal
        visible={modalAberto}
        onClose={() => setModalAberto(false)}
        onJoined={handleEntrou}
      />
    </View>
  );
}
