import { StatusBar } from "expo-status-bar";
import { Text, View, Image, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginScreen() {
  const { height } = useWindowDimensions();
  // Logotipo proporcional à altura: em iPhone SE não invade o formulário
  const logoSize = Math.min(256, height * 0.22);
  return (
    <View className="flex-1 bg-[#124B33]">
      <StatusBar style="light" />

      <View
        className="flex-1 items-center justify-center px-8"
        style={{ paddingBottom: height * 0.5 }}
      >
        
        <Image
          source={require("@/assets/images/logo-splash.png")} 
          style={{ width: logoSize, height: logoSize }} 
          resizeMode="contain"
        />

        <Text className="-mt-6 text-center text-4xl font-extrabold tracking-tight text-white">
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