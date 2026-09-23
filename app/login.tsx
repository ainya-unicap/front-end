import { StatusBar } from "expo-status-bar";
import { Sprout } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-emerald-950">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center px-8 py-14">
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

          <LoginForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
