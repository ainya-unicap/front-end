import { Text, View } from "react-native";
import { AppIcon } from "@/components/ui/AppIcon";

type SuccessCardProps = {
  title: string;
  subtitle: string;
  synced: boolean;
};

export function SuccessCard({ title, subtitle, synced }: SuccessCardProps) {
  return (
    <View className="mb-4 items-center rounded-3xl bg-emerald-700 px-6 py-8">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400">
        <AppIcon name="check" size={30} color="#ffffff" weight="bold" />
      </View>

      <Text className="text-center text-2xl font-extrabold text-white">
        {title}
      </Text>

      <Text className="mt-3 text-center text-base font-semibold text-emerald-100">
        {subtitle}
      </Text>

      <View className="mt-4 rounded-full bg-emerald-500 px-4 py-2">
        <View className="flex-row items-center">
          <AppIcon
            name={synced ? "check" : "warning"}
            size={14}
            color="#ffffff"
            weight="bold"
          />
          <Text className="ml-1 text-xs font-bold text-white">
            {synced ? "Registro completo" : "Registro incompleto"}
          </Text>
        </View>
      </View>
    </View>
  );
}