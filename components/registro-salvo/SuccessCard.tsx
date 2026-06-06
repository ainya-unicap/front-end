import { Text, View } from "react-native";

type SuccessCardProps = {
  title: string;
  subtitle: string;
  synced: boolean;
};

export function SuccessCard({ title, subtitle, synced }: SuccessCardProps) {
  return (
    <View className="mb-4 items-center rounded-3xl bg-emerald-700 px-6 py-8">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400">
        <Text className="text-3xl text-white">✓</Text>
      </View>

      <Text className="text-center text-2xl font-extrabold text-white">
        {title}
      </Text>

      <Text className="mt-3 text-center text-base font-semibold text-emerald-100">
        {subtitle}
      </Text>

      <View className="mt-4 rounded-full bg-emerald-500 px-4 py-2">
        <Text className="text-xs font-bold text-white">
          {synced ? "☁️ Sincronizado" : "⚠️ Pendente"}
        </Text>
      </View>
    </View>
  );
}