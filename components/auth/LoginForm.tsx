import { Link, useRouter } from "expo-router";
import { CheckCircle2, Lock, AtSign } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Recaptcha, { RecaptchaRef } from "react-native-recaptcha-that-works";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { login } from "@/database/auth";
import { normalizeEmail, validateEmail } from "@/lib/email";
import { PERFIL_LABEL, PerfilAcademico } from "@/lib/perfil";

const RECAPTCHA_SITE_KEY = "6LeMKeQtAAAAAB-ZrXXa3hHf814yzTXwdDO1_gaS";
const RECAPTCHA_BASE_URL = "http://localhost"; // o mesmo domínio cadastrado no console

export function LoginForm() {
  const router = useRouter();
  const recaptchaRef = useRef<RecaptchaRef>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [perfil, setPerfil] = useState<PerfilAcademico | null>(null);

  const emailCheck = useMemo(() => validateEmail(email), [email]);

  const senhaError = submitted && !senha ? "Informe sua senha." : undefined;
  const emailError =
    submitted && !emailCheck.valid ? emailCheck.message : undefined;

  function handleEmailChange(value: string) {
    setEmail(normalizeEmail(value));
    setPerfil(null);
  }

  // 1) Valida o formulário e abre o captcha
  function handleSubmit() {
    setSubmitted(true);

    if (!emailCheck.valid || !senha) return;
    if (submitting) return;

    recaptchaRef.current?.open();
  }

  // 2) Captcha resolvido: faz o login com o token
  async function handleVerify(recaptchaToken: string) {
    if (!emailCheck.valid) return;

    setSubmitting(true);

    const result = await login({
      email: emailCheck.value,
      senha,
      recaptchaToken,
    });

    setSubmitting(false);

    if (!result.ok) {
      Alert.alert("Não foi possível entrar", result.message);
      return;
    }

    setPerfil(result.perfil);
    router.replace("/(tabs)");
  }

  return (
    <View className="w-full rounded-t-[28px] bg-white px-6 pb-8 pt-7">
      <Text className="mb-6 text-2xl font-extrabold tracking-tight text-slate-900">
        Entrar
      </Text>

      <TextField
        label="Email"
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Digite seu email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        textContentType="username"
        icon={<AtSign size={20} color={emailError ? "#ef4444" : "#64748b"} />}
        tone={emailError ? "error" : perfil ? "success" : "neutral"}
        trailing={
          perfil ? (
            <View className="rounded-full bg-emerald-100 px-2.5 py-1">
              <Text className="text-[10px] font-bold uppercase text-emerald-700">
                {PERFIL_LABEL[perfil]}
              </Text>
            </View>
          ) : undefined
        }
        helperIcon={
          perfil && !emailError ? (
            <CheckCircle2 size={14} color="#047857" />
          ) : undefined
        }
      />

      <TextField
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        placeholder="Digite sua senha"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        textContentType="password"
        secureToggle
        onSubmitEditing={handleSubmit}
        icon={<Lock size={20} color={senhaError ? "#ef4444" : "#64748b"} />}
        tone={senhaError ? "error" : "neutral"}
        helper={senhaError}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          Alert.alert(
            "Recuperar senha",
            "Procure o professor responsável pela turma para redefinir sua senha."
          )
        }
        className="mb-5 self-end active:opacity-60"
      >
        <Text className="text-sm font-bold text-emerald-800">
          Esqueci minha senha
        </Text>
      </Pressable>

      <Button label="Entrar" onPress={handleSubmit} loading={submitting} />

      <Text className="mt-5 text-center text-sm text-slate-500">
        Ainda não possui uma conta?{" "}
        <Link href="/cadastro" asChild>
          <Text className="font-bold text-emerald-800">Cadastrar</Text>
        </Link>
      </Text>

      <Recaptcha
        ref={recaptchaRef}
        siteKey={RECAPTCHA_SITE_KEY}
        baseUrl={RECAPTCHA_BASE_URL}
        size="normal" // use "invisible" se sua chave for invisível
        onVerify={handleVerify}
        onExpire={() =>
          Alert.alert("Captcha expirado", "Tente entrar novamente.")
        }
        onError={() =>
          Alert.alert("Erro", "Não foi possível carregar o captcha.")
        }
      />
    </View>
  );
}