import { Text, View } from "react-native";
import { type AlunoResumo } from "@/services/api";

type HomeHeaderProps = {
  resumo: AlunoResumo; 
  nomeUsuario?: string;
};

export function HomeHeader({ resumo, nomeUsuario = "Deivyson" }: HomeHeaderProps) {
  return (
    <View className="rounded-b-3xl bg-emerald-900 px-6 pb-4 pt-14">
      <Text className="text-3xl font-bold text-white">
        Olá, {nomeUsuario}
      </Text>
    </View>
  );
}