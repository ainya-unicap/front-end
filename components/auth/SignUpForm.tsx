import { useRouter } from "expo-router";
import { CheckCircle2, IdCard, Lock, Mail, User } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import useSWR from "swr";

import {
  InstitutionItem,
  InstitutionSelect,
} from "@/components/auth/InstitutionSelect";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { cadastro } from "@/database/auth";
import { getInstitutions } from "@/database/institutions";
import { normalizeMatricula, validateMatricula } from "@/lib/matricula";
import { PerfilAcademico } from "@/lib/perfil";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

type FormErrors = Partial<
  Record<
    "name" | "matricula" | "email" | "instituicao" | "senha" | "confirmacao",
    string
  >
>;

export function SignUpForm() {
  const router = useRouter();

  const [role, setRole] = useState<PerfilAcademico>("aluno");
  const [name, setName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [instituicao, setInstituicao] = useState<string | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
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
    if (!matriculaCheck.valid) result.matricula = matriculaCheck.message;
    if (!EMAIL_PATTERN.test(email.trim())) result.email = "E-mail inválido.";
    if (!instituicao) result.instituicao = "Selecione sua instituição.";
    if (senha.length < MIN_PASSWORD_LENGTH) {
      result.senha = `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (senha !== confirmacao) result.confirmacao = "As senhas não conferem.";

    return result;
  }, [
    submitted,
    name,
    matriculaCheck,
    email,
    instituicao,
    senha,
    confirmacao,
  ]);

  async function handleSubmit() {
    setSubmitted(true);

    const invalid =
      !name.trim() ||
      !matriculaCheck.valid ||
      !EMAIL_PATTERN.test(email.trim()) ||
      !instituicao ||
      senha.length < MIN_PASSWORD_LENGTH ||
      senha !== confirmacao;

    if (invalid) return;

    setSubmitting(true);

    const result = await cadastro({
      role,
      name: name.trim(),
      matricula: matriculaCheck.value,
      email: email.trim(),
      instituicao,
      senha,
    });

    setSubmitting(false);

    if (!result.ok) {
      Alert.alert("Não foi possível cadastrar", result.message);
      return;
    }

    Alert.alert("Conta criada", "Agora entre com sua matrícula e senha.");
    router.replace("/login");
  }

  return (
    <View>
      <RoleSelector value={role} onChange={setRole} />

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
        label="Matrícula"
        value={matricula}
        onChangeText={(value) => setMatricula(normalizeMatricula(value))}
        placeholder="Digite sua matrícula"
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
        icon={
          <IdCard size={20} color={errors.matricula ? "#ef4444" : "#64748b"} />
        }
        tone={
          errors.matricula
            ? "error"
            : matriculaCheck.valid
              ? "success"
              : "neutral"
        }
        helper={
          errors.matricula ??
          (matriculaCheck.valid
            ? "Enviada para a instituição confirmar seu vínculo."
            : "Usada para identificar seu vínculo acadêmico.")
        }
        helperIcon={
          !errors.matricula && matriculaCheck.valid ? (
            <CheckCircle2 size={14} color="#047857" />
          ) : undefined
        }
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

      <InstitutionSelect
        items={items}
        value={instituicao}
        onChange={setInstituicao}
        loading={isLoading}
        error={
          instituicoesError
            ? "Não foi possível carregar as instituições."
            : errors.instituicao
        }
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
        onSubmitEditing={handleSubmit}
        icon={
          <Lock size={20} color={errors.confirmacao ? "#ef4444" : "#64748b"} />
        }
        tone={errors.confirmacao ? "error" : "neutral"}
        helper={errors.confirmacao}
      />

      <View className="mt-2">
        <Button label="Cadastrar" onPress={handleSubmit} loading={submitting} />
      </View>
    </View>
  );
}
