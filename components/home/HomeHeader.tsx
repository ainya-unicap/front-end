import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type AlunoResumo } from "@/services/api";

type HomeHeaderProps = {
  resumo: AlunoResumo; 
  nomeUsuario?: string;
};

export function HomeHeader({ resumo, nomeUsuario }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="rounded-b-3xl bg-emerald-900 px-6 pb-4" style={{ paddingTop: insets.top + 16 }}>
      <Text className="text-3xl font-bold text-white">
        Olá{nomeUsuario ? `, ${nomeUsuario}` : ""}
      </Text>
    </View>
  );
}