import { Text, View } from "react-native";
import { type AlunoResumo } from "@/services/api";

type HomeHeaderProps = {
  resumo: AlunoResumo;
  usingMock?: boolean;
};

export function HomeHeader({ resumo, usingMock = false }: HomeHeaderProps) {
  return (
    <View className="rounded-b-3xl bg-emerald-900 px-6 pb-5 pt-14">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-emerald-100">Registros</Text>
          <Text className="text-lg font-bold text-white">
            {resumo.total_formularios}
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-sm text-emerald-100">Semanas</Text>
          <Text className="text-lg font-bold text-white">
            {resumo.total_semanas}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-sm text-emerald-100">Relatórios</Text>
          <Text className="text-lg font-bold text-white">
            {resumo.total_relatorios}
          </Text>
        </View>
      </View>

      {usingMock && (
        <Text className="mt-3 text-xs text-emerald-100">
          Visualização com dados de exemplo
        </Text>
      )}
    </View>
  );
}