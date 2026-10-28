import { useMemo } from "react";
import { Text, View } from "react-native";

// Política de senha do servidor (fonte de verdade): mínimo de 6 caracteres.
// As demais regras são só recomendações e não bloqueiam o botão.
export const MIN_PASSWORD_LENGTH = 6;

export type PasswordRequirement = {
  id: string;
  label: string;
  met: boolean;
  required: boolean;
};

export function evaluatePassword(senha: string, confirmacao: string) {
  const requirements: PasswordRequirement[] = [
    {
      id: "length",
      label: `Ao menos ${MIN_PASSWORD_LENGTH} caracteres`,
      met: senha.length >= MIN_PASSWORD_LENGTH,
      required: true,
    },
    {
      id: "match",
      label: "As duas senhas coincidem",
      met: senha.length > 0 && senha === confirmacao,
      required: true,
    },
    {
      id: "long",
      label: "Recomendado: 8 caracteres ou mais",
      met: senha.length >= 8,
      required: false,
    },
    {
      id: "upper",
      label: "Recomendado: uma letra maiúscula",
      met: /[A-Z]/.test(senha),
      required: false,
    },
    {
      id: "digit",
      label: "Recomendado: um número",
      met: /\d/.test(senha),
      required: false,
    },
    {
      id: "special",
      label: "Recomendado: um caractere especial",
      met: /[^A-Za-z0-9]/.test(senha),
      required: false,
    },
  ];

  const strength = senha
    ? requirements.filter((item) => item.id !== "match" && item.met).length
    : 0;

  return {
    requirements,
    strength, // 0 a 5
    valid: requirements.filter((item) => item.required).every((item) => item.met),
  };
}

const LEVELS = [
  { label: "Muito fraca", bar: "bg-red-500", text: "text-red-600", width: "20%" },
  { label: "Fraca", bar: "bg-red-500", text: "text-red-600", width: "40%" },
  { label: "Média", bar: "bg-amber-500", text: "text-amber-600", width: "60%" },
  { label: "Boa", bar: "bg-emerald-500", text: "text-emerald-700", width: "80%" },
  { label: "Forte", bar: "bg-emerald-700", text: "text-emerald-800", width: "100%" },
] as const;

type PasswordStrengthProps = {
  senha: string;
  confirmacao: string;
};

export function PasswordStrength({ senha, confirmacao }: PasswordStrengthProps) {
  const { requirements, strength } = useMemo(
    () => evaluatePassword(senha, confirmacao),
    [senha, confirmacao]
  );

  const level = LEVELS[Math.max(0, Math.min(strength, 5) - 1)];

  return (
    <View className="mb-4">
      {senha ? (
        <View
          className="mb-4"
          accessible
          accessibilityLabel={`Força da senha: ${level.label}`}
        >
          <View className="h-2 overflow-hidden rounded-full bg-slate-200">
            <View
              className={`h-full rounded-full ${level.bar}`}
              style={{ width: level.width }}
            />
          </View>
          <Text className={`mt-1.5 text-xs font-bold ${level.text}`}>
            Força: {level.label}
          </Text>
        </View>
      ) : null}

      {requirements.map((item) => (
        <View
          key={item.id}
          className="mb-1.5 flex-row items-center"
          accessible
          accessibilityLabel={`${item.label}: ${item.met ? "atendido" : "pendente"}`}
        >
          <Text
            className={`mr-2 text-base ${
              item.met ? "text-emerald-700" : "text-slate-300"
            }`}
          >
            {item.met ? "✓" : "○"}
          </Text>
          <Text
            className={`flex-1 text-sm ${
              item.met
                ? "font-semibold text-emerald-800"
                : item.required
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
