import { ComponentRef, useRef } from "react";
import { Text, TextInput, View } from "react-native";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
  autoFocus?: boolean;
  label?: string;
};

// Código de verificação em campos separados: avança sozinho ao digitar,
// aceita colar o código inteiro e volta com o backspace.
export function OtpInput({
  value,
  onChange,
  length = 6,
  hasError = false,
  autoFocus = false,
  label = "Código de verificação",
}: OtpInputProps) {
  const refs = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);

  function focusAt(index: number) {
    refs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  }

  function handleChange(index: number, text: string) {
    const digits = text.replace(/\D/g, "");

    // Apagou o dígito deste campo
    if (!digits) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }

    // Digitou ou colou: preenche a partir deste campo
    const next = (value.slice(0, index) + digits).slice(0, length);
    onChange(next);
    focusAt(next.length);
  }

  function handleKeyPress(index: number, key: string) {
    // Backspace em campo vazio volta para o anterior e apaga o dígito dele
    if (key === "Backspace" && !value[index] && index > 0) {
      onChange(value.slice(0, index - 1));
      focusAt(index - 1);
    }
  }

  return (
    <View
      accessible
      accessibilityLabel={label}
      className="mb-2 flex-row justify-between"
    >
      {Array.from({ length }, (_, index) => {
        const filled = !!value[index];
        return (
          <TextInput
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            value={value[index] ?? ""}
            onChangeText={(text) => handleChange(index, text)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            onFocus={() => {
              // Mantém o foco no primeiro campo vazio
              if (index > value.length) focusAt(value.length);
            }}
            keyboardType="number-pad"
            inputMode="numeric"
            textContentType={index === 0 ? "oneTimeCode" : "none"}
            autoComplete={index === 0 ? "sms-otp" : "off"}
            autoFocus={autoFocus && index === 0}
            selectTextOnFocus
            accessibilityLabel={`${label}, dígito ${index + 1} de ${length}`}
            className={`h-14 w-12 rounded-2xl border text-center text-xl font-extrabold text-slate-900 ${
              hasError
                ? "border-red-500 bg-white"
                : filled
                ? "border-emerald-600 bg-white"
                : "border-slate-200 bg-slate-50"
            }`}
          />
        );
      })}
    </View>
  );
}

export function OtpHelper({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <Text
      accessibilityLiveRegion="polite"
      className="mb-2 mt-1 text-xs font-semibold text-red-600"
    >
      {message}
    </Text>
  );
}
