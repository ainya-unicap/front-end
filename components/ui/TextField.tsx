import { Eye, EyeOff } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

type FocusHandler = NonNullable<TextInputProps["onFocus"]>;

export type FieldTone = "neutral" | "success" | "error";

export type TextFieldProps = Omit<TextInputProps, "className"> & {
  label: string;
  /** Ícone exibido à esquerda do campo. */
  icon?: ReactNode;
  /** Conteúdo fixo à direita (ex.: badge de perfil). */
  trailing?: ReactNode;
  /** Mensagem de apoio abaixo do campo. */
  helper?: string;
  helperIcon?: ReactNode;
  tone?: FieldTone;
  /** Exibe o botão de mostrar/ocultar senha. */
  secureToggle?: boolean;
};

const BORDER: Record<FieldTone, string> = {
  neutral: "border-slate-200 bg-slate-50",
  success: "border-emerald-600 bg-white",
  error: "border-red-500 bg-white",
};

const HELPER_TEXT: Record<FieldTone, string> = {
  neutral: "text-slate-400",
  success: "text-emerald-700",
  error: "text-red-600",
};

export function TextField({
  label,
  icon,
  trailing,
  helper,
  helperIcon,
  tone = "neutral",
  secureToggle = false,
  secureTextEntry,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isSecure = secureToggle ? !revealed : secureTextEntry;

  const borderClass =
    tone === "neutral" && focused
      ? "border-slate-900 bg-white"
      : BORDER[tone];

  const handleFocus: FocusHandler = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: FocusHandler = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </Text>

      <View
        className={`h-14 flex-row items-center rounded-2xl border px-4 ${borderClass}`}
      >
        {icon ? <View className="mr-3">{icon}</View> : null}

        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#94a3b8"
          className="flex-1 text-base font-semibold text-slate-900"
        />

        {trailing ? <View className="ml-2">{trailing}</View> : null}

        {secureToggle ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Ocultar senha" : "Mostrar senha"}
            className="ml-2 active:opacity-60"
          >
            {revealed ? (
              <EyeOff size={20} color="#94a3b8" />
            ) : (
              <Eye size={20} color="#94a3b8" />
            )}
          </Pressable>
        ) : null}
      </View>

      {helper ? (
        <View
          className="mt-2 flex-row items-center"
          accessibilityLiveRegion={tone === "error" ? "polite" : "none"}
        >
          {helperIcon ? <View className="mr-1.5">{helperIcon}</View> : null}

          <Text className={`flex-1 text-xs font-semibold ${HELPER_TEXT[tone]}`}>
            {helper}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
