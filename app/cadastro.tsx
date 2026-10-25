import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SignUpForm } from "@/components/auth/SignUpForm";
import HeaderStack from "@/components/navigation/headerStack";

export default function CadastroScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      <StatusBar style="dark" />
      

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <HeaderStack title="Cadastro" />
          <SignUpForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
