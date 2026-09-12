import { Link, useRouter } from "expo-router";
import { CheckCircle2, IdCard, Lock } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { login } from "@/database/auth";
import { normalizeMatricula, validateMatricula } from "@/lib/matricula";
import { PERFIL_LABEL, PerfilAcademico } from "@/lib/perfil";

export function LoginForm() {
  const router = useRouter();

  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [perfil, setPerfil] = useState<PerfilAcademico | null>(null);

  const matriculaCheck = useMemo(
    () => validateMatricula(matricula),
    [matricula]
  );

  const senhaError = submitted && !senha ? "Informe sua senha." : undefined;
  const matriculaError =
    submitted && !matriculaCheck.valid ? matriculaCheck.message : undefined;

  function handleMatriculaChange(value: string) {
    setMatricula(normalizeMatricula(value));
    setPerfil(null);
  }

  async function handleSubmit() {
    setSubmitted(true);

    if (!matriculaCheck.valid || !senha) return;

    setSubmitting(true);

    const result = await login({ matricula: matriculaCheck.value, senha });

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
        label="Matrícula"
        value={matricula}
        onChangeText={handleMatriculaChange}
        placeholder="Digite sua matrícula"
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        textContentType="username"
        icon={
          <IdCard size={20} color={matriculaError ? "#ef4444" : "#64748b"} />
        }
        tone={matriculaError ? "error" : perfil ? "success" : "neutral"}
        trailing={
          perfil ? (
            <View className="rounded-full bg-emerald-100 px-2.5 py-1">
              <Text className="text-[10px] font-bold uppercase text-emerald-700">
                {PERFIL_LABEL[perfil]}
              </Text>
            </View>
          ) : undefined
        }
        helper={
          matriculaError ??
          (perfil
            ? `Perfil identificado: ${PERFIL_LABEL[perfil]}`
            : "Usada para identificar seu vínculo acadêmico.")
        }
        helperIcon={
          perfil && !matriculaError ? (
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
    </View>
  );
}
