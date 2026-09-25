import { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export type ButtonVariant = "primary" | "ghost";

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
};

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-emerald-800",
  ghost: "border border-emerald-200 bg-white",
};

const LABEL: Record<ButtonVariant, string> = {
  primary: "text-white",
  ghost: "text-emerald-800",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  accessibilityHint,
}: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`h-14 flex-row items-center justify-center rounded-2xl active:opacity-90 ${
        CONTAINER[variant]
      } ${inactive ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#ffffff" : "#065f46"} />
      ) : (
        <>
          {icon ? <View className="mr-2">{icon}</View> : null}

          <Text className={`text-base font-bold ${LABEL[variant]}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
