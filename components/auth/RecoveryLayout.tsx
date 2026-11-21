import { ReactNode } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import HeaderStack from "@/components/navigation/headerStack";
import { Stepper } from "@/components/relatorios/Stepper";

const STEPS = ["E-mail", "Código", "Nova senha"];

type RecoveryLayoutProps = {
  step: 0 | 1 | 2;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
};

// Estrutura comum das três telas de recuperação de senha
export function RecoveryLayout({ step, title, subtitle, children }: RecoveryLayoutProps) {
  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAwareScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-16"
        bottomOffset={40}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderStack title="Recuperar senha" />

        <View className="mb-6">
          <Stepper steps={STEPS} current={step} />
        </View>

        <Text
          accessibilityRole="header"
          className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900"
        >
          {title}
        </Text>
        <Text className="mb-6 text-base leading-6 text-slate-500">{subtitle}</Text>

        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}
