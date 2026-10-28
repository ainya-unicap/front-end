import { StatusBar } from "expo-status-bar";
import { Text, View, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-[#124B33]">
      <StatusBar style="light" />

      <View className="flex-1 items-center justify-center pb-96 px-8">
        
        <Image
          source={require("@/assets/images/logo-splash.png")} 
          className="h-64 w-64" 
          resizeMode="contain"
        />

        <Text className="-mt-12 text-center text-4xl font-extrabold tracking-tight text-white">
          Forrageia
        </Text>

      </View>

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