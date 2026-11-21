import { useRef, useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import Recaptcha, { RecaptchaRef } from "react-native-recaptcha-that-works";

import { RecoveryLayout } from "@/components/auth/RecoveryLayout";
import Warning from "@/components/forms/warning";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { requestPasswordCode } from "@/database/passwordRecovery";
import { extractApiError } from "@/lib/apiError";
import { usePasswordRecoveryStore } from "@/lib/passwordRecoveryStore";
import { RECAPTCHA_BASE_URL, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecuperarSenhaScreen() {
  const recaptchaRef = useRef<RecaptchaRef>(null);
  const setStoreEmail = usePasswordRecoveryStore((state) => state.setEmail);
  const clear = usePasswordRecoveryStore((state) => state.clear);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const emailValue = email.trim().toLowerCase();
  const emailError = !submitted
    ? undefined
    : !emailValue
    ? "Informe seu e-mail."
    : !EMAIL_PATTERN.test(emailValue)
    ? "Formato: email@dominio.com"
    : undefined;

  function handleEnviar() {
    setSubmitted(true);
    if (sending || !EMAIL_PATTERN.test(emailValue)) return;
    // O captcha protege o envio de e-mails; o pedido sai em handleVerify
    recaptchaRef.current?.open();
  }

  async function handleVerify(recaptchaToken: string) {
    if (sending) return;

    try {
      setSending(true);
      await requestPasswordCode(emailValue, recaptchaToken);

      // A resposta é a mesma exista ou não a conta: sempre avança
      clear();
      setStoreEmail(emailValue);
      router.push("/recuperar-senha/codigo" as any);
    } catch (error) {
      Alert.alert(
        "Não foi possível enviar o código",
        extractApiError(error, "Tente novamente em alguns instantes.")
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <RecoveryLayout
      step={0}
      title="Esqueceu sua senha?"
      subtitle="Informe o e-mail cadastrado e enviaremos um código de verificação para você criar uma nova senha."
    >
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        autoFocus
        returnKeyType="send"
        onSubmitEditing={handleEnviar}
        icon={<Mail size={20} color={emailError ? "#ef4444" : "#64748b"} />}
        tone={emailError ? "error" : "neutral"}
        helper={emailError}
      />

      <Warning text="O código chega em alguns instantes e vale por 10 minutos. Confira também a caixa de spam." />

      <View className="gap-3">
        <Button label="Enviar código" onPress={handleEnviar} loading={sending} />
        <Button
          label="Voltar para o login"
          variant="ghost"
          onPress={() => router.back()}
          disabled={sending}
        />
      </View>

      <Recaptcha
        ref={recaptchaRef}
        siteKey={RECAPTCHA_SITE_KEY}
        baseUrl={RECAPTCHA_BASE_URL}
        action="recuperar_senha"
        size="normal"
        onVerify={handleVerify}
        onExpire={() => Alert.alert("Captcha expirado", "Tente enviar o código novamente.")}
        onError={() => Alert.alert("Erro", "Não foi possível carregar o captcha.")}
      />
    </RecoveryLayout>
  );
}
