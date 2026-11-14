import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import useSWR, { mutate } from "swr";

import HeaderStack from "@/components/navigation/headerStack";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { TextField } from "@/components/ui/TextField";
import { getInstitutions } from "@/database/institutions";
import { getProfile, updateProfile } from "@/database/user";
import { extractApiError } from "@/lib/apiError";

type Campo = "nome" | "senha" | "instituicao";

const TITULOS: Record<Campo, string> = {
  nome: "Editar nome",
  senha: "Alterar senha",
  instituicao: "Editar instituição",
};

const MIN_PASSWORD_LENGTH = 6;

type Option = { value: string; label: string; hint?: string };

function OptionList({
  items,
  value,
  onChange,
  emptyText,
}: {
  items: Option[];
  value: string | null;
  onChange: (value: string) => void;
  emptyText: string;
}) {
  if (items.length === 0) {
    return <Text className="py-6 text-center text-sm text-slate-400">{emptyText}</Text>;
  }

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            className={`px-4 py-4 active:opacity-80 ${
              index < items.length - 1 ? "border-b border-slate-100" : ""
            } ${selected ? "bg-emerald-50" : ""}`}
          >
            <Text
              className={`text-base ${
                selected ? "font-bold text-[#124B33]" : "font-semibold text-slate-700"
              }`}
            >
              {item.label}
            </Text>
            {item.hint ? (
              <Text className="mt-0.5 text-sm text-slate-400">{item.hint}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function EditarPerfilScreen() {
  const { campo } = useLocalSearchParams<{ campo: Campo }>();

  const { data: perfilResp } = useSWR("perfil", () => getProfile());
  const perfil = (perfilResp as any)?.data ?? perfilResp;

  if (campo !== "nome" && campo !== "senha" && campo !== "instituicao") {
    return (
      <View className="flex-1 bg-slate-50 px-5">
        <HeaderStack title="Editar perfil" />
        <Text className="text-base text-slate-500">Campo inválido.</Text>
      </View>
    );
  }

  if (!perfil) {
    return (
      <View className="flex-1 bg-slate-50 px-5">
        <HeaderStack title={TITULOS[campo]} />
        <View className="gap-3">
          <Skeleton width="100%" height={56} />
          <Skeleton width="100%" height={56} />
        </View>
      </View>
    );
  }

  return <EditarCampoForm campo={campo} perfil={perfil} />;
}

function EditarCampoForm({ campo, perfil }: { campo: Campo; perfil: any }) {

  const { data: instituicoes, isLoading: loadingInstituicoes } = useSWR(
    campo === "instituicao" ? "/institutions" : null,
    getInstitutions
  );

  const [nome, setNome] = useState<string>(perfil.name ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [selecionado, setSelecionado] = useState<string | null>(
    campo === "instituicao" ? perfil.institution?.id ?? null : null
  );
  const [erro, setErro] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const instituicaoItems: Option[] = useMemo(
    () =>
      (instituicoes ?? []).map((i: { id: string; name: string; abbreviation?: string }) => ({
        value: i.id,
        label: i.abbreviation ? `${i.abbreviation} — ${i.name}` : i.name,
      })),
    [instituicoes]
  );

  async function salvar(action: () => Promise<unknown>, sucesso: string) {
    setErro(null);
    try {
      setSaving(true);
      await action();
      // Perfil e home (nome no cabeçalho) passam a refletir a alteração
      await Promise.all([mutate("perfil"), mutate("home")]);
      Alert.alert("Pronto", sucesso);
      router.back();
    } catch (error) {
      setErro(extractApiError(error, "Não foi possível salvar. Tente novamente."));
    } finally {
      setSaving(false);
    }
  }

  function handleSalvar() {
    if (campo === "nome") {
      if (nome.trim().length < 2) return setErro("O nome deve ter pelo menos 2 caracteres.");
      return salvar(() => updateProfile({ name: nome.trim() }), "Nome atualizado.");
    }

    if (campo === "senha") {
      if (!senhaAtual) return setErro("Informe a senha atual.");
      if (novaSenha.length < MIN_PASSWORD_LENGTH)
        return setErro(`A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      if (novaSenha !== confirmacao) return setErro("A confirmação não confere com a nova senha.");
      return salvar(
        () => updateProfile({ password: novaSenha, currentPassword: senhaAtual }),
        "Senha alterada."
      );
    }

    if (!selecionado) return setErro("Selecione uma instituição.");
    return salvar(() => updateProfile({ institution_id: selecionado }), "Instituição atualizada.");
  }

  function handleRemoverVinculo() {
    Alert.alert("Remover vínculo", "Deseja desvincular a instituição?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () =>
          salvar(() => updateProfile({ institution_id: null }), "Instituição desvinculada."),
      },
    ]);
  }

  const carregando = campo === "instituicao" && loadingInstituicoes;
  const temVinculoAtual = campo === "instituicao" && !!perfil?.institution;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-16"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderStack title={TITULOS[campo]} />

        {carregando ? (
          <View className="gap-3">
            <Skeleton width="100%" height={56} />
            <Skeleton width="100%" height={56} />
          </View>
        ) : (
          <>
            {campo === "nome" ? (
              <TextField
                label="Nome completo"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                autoComplete="name"
              />
            ) : null}

            {campo === "senha" ? (
              <>
                <TextField
                  label="Senha atual"
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureToggle
                  autoCapitalize="none"
                />
                <TextField
                  label="Nova senha"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureToggle
                  autoCapitalize="none"
                  helper={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
                />
                <TextField
                  label="Confirmar nova senha"
                  value={confirmacao}
                  onChangeText={setConfirmacao}
                  secureToggle
                  autoCapitalize="none"
                />
              </>
            ) : null}

            {campo === "instituicao" ? (
              <OptionList
                items={instituicaoItems}
                value={selecionado}
                onChange={setSelecionado}
                emptyText="Nenhuma instituição disponível."
              />
            ) : null}

            {erro ? (
              <Text
                className="mb-4 text-sm font-semibold text-red-600"
                accessibilityLiveRegion="polite"
              >
                {erro}
              </Text>
            ) : null}

            <Button label="Salvar" onPress={handleSalvar} loading={saving} />

            {temVinculoAtual ? (
              <View className="mt-3">
                <Button
                  label="Remover vínculo"
                  variant="ghost"
                  onPress={handleRemoverVinculo}
                  disabled={saving}
                />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
