import { useRouter } from "expo-router";
import { CheckCircle2, IdCard, Lock, Mail, User } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Checkbox from "expo-checkbox";
import Recaptcha, { RecaptchaRef } from "react-native-recaptcha-that-works";
import useSWR from "swr";

import {
  InstitutionItem,
  InstitutionSelect,
} from "@/components/auth/InstitutionSelect";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { cadastro } from "@/database/auth";
import { getInstitutions } from "@/database/institutions";
import { normalizeMatricula, validateMatricula } from "@/lib/matricula";
import { PerfilAcademico } from "@/lib/perfil";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const RECAPTCHA_SITE_KEY = "SUA_SITE_KEY";
const RECAPTCHA_BASE_URL = "http://localhost";

type FormErrors = Partial<
  Record<
    "name" | "matricula" | "email" | "instituicao" | "senha" | "confirmacao",
    string
  >
>;

export function SignUpForm() {
  const router = useRouter();
  const recaptchaRef = useRef<RecaptchaRef>(null);

  const [role, setRole] = useState<PerfilAcademico>("aluno");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  
  // Controle do vínculo institucional
  const [temVinculo, setTemVinculo] = useState(false);
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState<string | null>(null);
  
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: instituicoes,
    error: instituicoesError,
    isLoading,
  } = useSWR("/institutions", getInstitutions);

  const items: InstitutionItem[] = useMemo(
    () =>
      (instituicoes ?? []).map((item: { id: string; name: string }) => ({
        label: item.name,
        value: item.id,
      })),
    [instituicoes]
  );

  const matriculaCheck = useMemo(
    () => validateMatricula(matricula),
    [matricula]
  );

  const errors: FormErrors = useMemo(() => {
    if (!submitted) return {};

    const result: FormErrors = {};

    if (!name.trim()) result.name = "Informe seu nome completo.";
    if (!EMAIL_PATTERN.test(email.trim())) result.email = "E-mail inválido.";
    if (senha.length < MIN_PASSWORD_LENGTH) {
      result.senha = `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (senha !== confirmacao) result.confirmacao = "As senhas não conferem.";

    // Valida matrícula e instituição APENAS se o checkbox estiver marcado
    if (temVinculo) {
      if (!matriculaCheck.valid) result.matricula = matriculaCheck.message;
      if (!instituicao) result.instituicao = "Selecione sua instituição.";
    }

    return result;
  }, [
    submitted,
    name,
    email,
    senha,
    confirmacao,
    temVinculo,
    matriculaCheck,
    instituicao,
  ]);

  function handleSubmit() {
    setSubmitted(true);

    const invalid =
      !name.trim() ||
      !EMAIL_PATTERN.test(email.trim()) ||
      senha.length < MIN_PASSWORD_LENGTH ||
      senha !== confirmacao ||
      (temVinculo && (!matriculaCheck.valid || !instituicao));

    if (invalid) return;
    if (submitting) return;

    recaptchaRef.current?.open();
  }

  async function handleVerify(recaptchaToken: string) {
    if (temVinculo && (!instituicao || !matriculaCheck.valid)) return;

    setSubmitting(true);

    const result = await cadastro({
      role,
      name: name.trim(),
      email: email.trim(),
      senha,
      recaptchaToken,
      // Se não tiver vínculo, envia vazio para o banco
      matricula: temVinculo ? matriculaCheck.value : "",
      instituicao: temVinculo ? instituicao : null,
    });

    setSubmitting(false);

    if (!result.ok) {
      Alert.alert("Não foi possível cadastrar", result.message);
      return;
    }

    Alert.alert("Conta criada", "Agora entre com sua conta.");
    router.replace("/login");
  }

  return (
    <View>
      <TextField
        label="Nome"
        value={name}
        onChangeText={setName}
        placeholder="Digite seu nome"
        autoCapitalize="words"
        textContentType="name"
        icon={<User size={20} color={errors.name ? "#ef4444" : "#64748b"} />}
        tone={errors.name ? "error" : "neutral"}
        helper={errors.name}
      />

      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        icon={<Mail size={20} color={errors.email ? "#ef4444" : "#64748b"} />}
        tone={errors.email ? "error" : "neutral"}
        helper={errors.email}
      />

      <TextField
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        placeholder="Digite sua senha"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        secureToggle
        icon={<Lock size={20} color={errors.senha ? "#ef4444" : "#64748b"} />}
        tone={errors.senha ? "error" : "neutral"}
        helper={errors.senha}
      />

      <TextField
        label="Confirmar senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        placeholder="Confirme sua senha"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        secureToggle
        icon={<Lock size={20} color={errors.confirmacao ? "#ef4444" : "#64748b"} />}
        tone={errors.confirmacao ? "error" : "neutral"}
        helper={errors.confirmacao}
      />

      <Pressable 
        className="mb-6 mt-2 flex-row items-center"
        onPress={() => setTemVinculo(!temVinculo)}
      >
        <Checkbox
          value={temVinculo}
          onValueChange={setTemVinculo}
          color={temVinculo ? "#124B33" : undefined}
          className="h-7 w-7 rounded-md border-slate-300" 
        />
        <Text className="ml-3 flex-1 text-base font-bold text-slate-800">
          Sou vinculado(a) a uma instituição de ensino (Opcional)
        </Text>
      </Pressable>

      {/* Condicional: Só aparece se temVinculo for verdadeiro */}
      {temVinculo && (
        <>
          <TextField
            label="Matrícula"
            value={matricula}
            onChangeText={(value) => setMatricula(normalizeMatricula(value))}
            placeholder="Digite sua matrícula"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            autoCorrect={false}
            icon={<IdCard size={20} color={errors.matricula ? "#ef4444" : "#64748b"} />}
            tone={errors.matricula ? "error" : matriculaCheck.valid ? "success" : "neutral"}
            helper={errors.matricula}
            helperIcon={!errors.matricula && matriculaCheck.valid ? (
              <CheckCircle2 size={14} color="#047857" />
            ) : undefined}
          />

          <InstitutionSelect
            items={items}
            value={instituicao}
            onChange={setInstituicao}
            loading={isLoading}
            error={instituicoesError ? "Não foi possível carregar as instituições." : errors.instituicao}
          />
        </>
      )}

      <View className="mt-4">
        <Button label="Cadastrar" onPress={handleSubmit} loading={submitting} />
      </View>

      <Recaptcha
        ref={recaptchaRef}
        siteKey={RECAPTCHA_SITE_KEY}
        baseUrl={RECAPTCHA_BASE_URL}
        size="normal"
        onVerify={handleVerify}
        action="cadastro"
        onExpire={() => Alert.alert("Captcha expirado", "Tente cadastrar novamente.")}
        onError={() => Alert.alert("Erro", "Não foi possível carregar o captcha.")}
      />
    </View>
  );
}