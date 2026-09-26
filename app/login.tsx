import { StatusBar } from "expo-status-bar";
import { Sprout } from "lucide-react-native";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-emerald-950">
      <StatusBar style="light" />

      {/* Fundo */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="h-[68px] w-[68px] items-center justify-center rounded-3xl bg-white/10">
          <Sprout size={32} color="#7fdcae" />
        </View>

        <Text className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Forrage App
        </Text>

        <Text className="mt-1 text-center text-sm text-emerald-200">
          Acompanhamento de plantas forrageiras
        </Text>
      </View>

      {/* Camada do login */}
      <View
        className="absolute inset-0"
        pointerEvents="box-none"
      >
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
          bottomOffset={40}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LoginForm />
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
}