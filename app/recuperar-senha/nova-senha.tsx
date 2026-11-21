import { useEffect, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import { router } from "expo-router";
import { Lock } from "lucide-react-native";

import { evaluatePassword, PasswordStrength } from "@/components/auth/PasswordStrength";
import { RecoveryLayout } from "@/components/auth/RecoveryLayout";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { resetPassword } from "@/database/passwordRecovery";
import { extractApiError, extractApiErrorCode } from "@/lib/apiError";
import { usePasswordRecoveryStore } from "@/lib/passwordRecoveryStore";

export default function NovaSenhaScreen() {
  const email = usePasswordRecoveryStore((state) => state.email);
  const resetToken = usePasswordRecoveryStore((state) => state.resetToken);
  const clear = usePasswordRecoveryStore((state) => state.clear);

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | undefined>();

  // Evita que o clear() pós-sucesso dispare o redirecionamento da proteção abaixo
  const finished = useRef(false);

  const { valid } = evaluatePassword(senha, confirmacao);

  // Sem token em memória (app reaberto no meio do fluxo): recomeça na tela 1
  useEffect(() => {
    if (finished.current) return;
    if (!email || !resetToken) router.replace("/recuperar-senha" as any);
  }, [email, resetToken]);

  async function handleSalvar() {
    if (saving || !valid) return;

    try {
      setSaving(true);
      setErro(undefined);
      await resetPassword(email, resetToken, senha);

      finished.current = true;
      clear();
      Alert.alert("Senha alterada", "Agora você já pode entrar com a nova senha.");
      router.replace("/login");
    } catch (error) {
      if (extractApiErrorCode(error) === "TOKEN_INVALIDO_OU_EXPIRADO") {
        clear();
        Alert.alert(
          "Sessão de recuperação expirada",
          "Peça um novo código para redefinir sua senha."
        );
        router.replace("/recuperar-senha" as any);
        return;
      }

      setErro(extractApiError(error, "Não foi possível salvar a nova senha agora."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <RecoveryLayout
      step={2}
      title="Crie uma nova senha"
      subtitle="Evite reutilizar senhas de outros serviços. A nova senha substitui a anterior imediatamente."
    >
      <TextField
        label="Nova senha"
        value={senha}
        onChangeText={(value) => {
          setSenha(value);
          setErro(undefined);
        }}
        placeholder="Digite a nova senha"
        secureToggle
        autoCapitalize="none"
        autoComplete="new-password"
        autoFocus
        icon={<Lock size={20} color="#64748b" />}
      />

      <TextField
        label="Confirmar nova senha"
        value={confirmacao}
        onChangeText={(value) => {
          setConfirmacao(value);
          setErro(undefined);
        }}
        placeholder="Repita a nova senha"
        secureToggle
        autoCapitalize="none"
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={handleSalvar}
        icon={<Lock size={20} color="#64748b" />}
        tone={confirmacao && senha !== confirmacao ? "error" : "neutral"}
        helper={
          confirmacao && senha !== confirmacao ? "As senhas não coincidem." : undefined
        }
      />

      <PasswordStrength senha={senha} confirmacao={confirmacao} />

      {erro ? (
        <View accessibilityLiveRegion="polite" className="mb-4">
          <Text className="text-sm font-semibold text-red-600">{erro}</Text>
        </View>
      ) : null}

      <Button
        label="Salvar nova senha"
        onPress={handleSalvar}
        loading={saving}
        disabled={!valid}
      />
    </RecoveryLayout>
  );
}
