import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import Recaptcha, { RecaptchaRef } from "react-native-recaptcha-that-works";

import { OtpHelper, OtpInput } from "@/components/auth/OtpInput";
import { RecoveryLayout } from "@/components/auth/RecoveryLayout";
import Warning from "@/components/forms/warning";
import { Button } from "@/components/ui/Button";
import { requestPasswordCode, verifyPasswordCode } from "@/database/passwordRecovery";
import { extractApiError, extractApiErrorCode } from "@/lib/apiError";
import { usePasswordRecoveryStore } from "@/lib/passwordRecoveryStore";
import { RECAPTCHA_BASE_URL, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";

const CODE_LENGTH = 6;
// Mesmo intervalo mínimo entre pedidos que o backend aplica (60 s)
const RESEND_SECONDS = 60;

const ERROS_DO_CODIGO: Record<string, string> = {
  CODIGO_INVALIDO: "Código inválido. Confira os 6 dígitos e tente novamente.",
  CODIGO_EXPIRADO: "Este código expirou. Peça um novo código.",
  TENTATIVAS_EXCEDIDAS:
    "Você errou o código muitas vezes. Peça um novo código para continuar.",
};

function formatTimer(total: number) {
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function ConfirmarCodigoScreen() {
  const recaptchaRef = useRef<RecaptchaRef>(null);
  const email = usePasswordRecoveryStore((state) => state.email);
  const setResetToken = usePasswordRecoveryStore((state) => state.setResetToken);

  const [code, setCode] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  // Sem e-mail em memória (app reaberto no meio do fluxo): recomeça na tela 1
  useEffect(() => {
    if (!email) router.replace("/recuperar-senha" as any);
  }, [email]);

  // Contador regressivo do reenvio
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function handleChange(value: string) {
    setCode(value);
    setErro(undefined);
  }

  async function handleConfirmar() {
    if (verifying) return;
    if (code.length !== CODE_LENGTH) {
      setErro("Digite os 6 dígitos do código.");
      return;
    }

    try {
      setVerifying(true);
      const { resetToken } = await verifyPasswordCode(email, code);
      setResetToken(resetToken);
      router.replace("/recuperar-senha/nova-senha" as any);
    } catch (error) {
      const codigo = extractApiErrorCode(error);
      setErro(
        (codigo && ERROS_DO_CODIGO[codigo]) ??
          extractApiError(error, "Não foi possível confirmar o código agora.")
      );
      setCode("");
    } finally {
      setVerifying(false);
    }
  }

  function handleReenviar() {
    if (secondsLeft > 0 || resending) return;
    recaptchaRef.current?.open();
  }

  async function handleVerifyCaptcha(recaptchaToken: string) {
    try {
      setResending(true);
      await requestPasswordCode(email, recaptchaToken);
      setCode("");
      setErro(undefined);
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert("Código reenviado", "Enviamos um novo código para o seu e-mail.");
    } catch (error) {
      Alert.alert(
        "Não foi possível reenviar",
        extractApiError(error, "Tente novamente em alguns instantes.")
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <RecoveryLayout
      step={1}
      title="Confirme o código"
      subtitle={
        <>
          Digite o código de 6 dígitos que enviamos para{" "}
          <Text className="font-bold text-slate-800">{email}</Text>.
        </>
      }
    >
      <OtpInput
        value={code}
        onChange={handleChange}
        length={CODE_LENGTH}
        hasError={!!erro}
        autoFocus
      />
      <OtpHelper message={erro} />

      <View className="mb-6 mt-3 items-center">
        {secondsLeft > 0 ? (
          <Text
            accessibilityLiveRegion="polite"
            className="text-sm font-semibold text-slate-400"
          >
            Reenviar código em {formatTimer(secondsLeft)}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={handleReenviar}
            disabled={resending}
            className="active:opacity-60"
          >
            <Text className="text-base font-bold text-[#124B33]">
              {resending ? "Reenviando..." : "Reenviar código"}
            </Text>
          </Pressable>
        )}
      </View>

      <Warning text="Nunca compartilhe este código com ninguém. A equipe do app jamais pedirá esse código por mensagem." />

      <View className="gap-3">
        <Button
          label="Confirmar código"
          onPress={handleConfirmar}
          loading={verifying}
          disabled={code.length !== CODE_LENGTH}
        />
        <Button
          label="Usar outro e-mail"
          variant="ghost"
          onPress={() => router.replace("/recuperar-senha" as any)}
          disabled={verifying}
        />
      </View>

      <Recaptcha
        ref={recaptchaRef}
        siteKey={RECAPTCHA_SITE_KEY}
        baseUrl={RECAPTCHA_BASE_URL}
        action="recuperar_senha"
        size="normal"
        onVerify={handleVerifyCaptcha}
        onExpire={() => Alert.alert("Captcha expirado", "Tente reenviar o código novamente.")}
        onError={() => Alert.alert("Erro", "Não foi possível carregar o captcha.")}
      />
    </RecoveryLayout>
  );
}
