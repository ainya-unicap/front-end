import { Pressable, Text, View } from "react-native";

type CanteiroSelectCardProps = {
  icon: string;
  name: string;
  subtitle: string;
  selected?: boolean;
  weeks?: string[];
  extraCount?: number;
  onPress?: () => void;
};

export function CanteiroSelectCard({
  icon,
  name,
  subtitle,
  selected,
  weeks,
  extraCount,
  onPress,
}: CanteiroSelectCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-2xl border p-4 active:opacity-80 ${
        selected ? "border-emerald-700 bg-emerald-50" : "border-slate-200 bg-white"
      }`}
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
          <Text className="text-2xl">{icon}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{name}</Text>
          <Text className="mt-0.5 text-sm text-slate-400">{subtitle}</Text>
        </View>

        {selected ? (
          <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-700">
            <Text className="text-xs font-bold text-white">✓</Text>
          </View>
        ) : (
          <View className="h-6 w-6 rounded-full border-2 border-slate-300" />
        )}
      </View>

      {selected && weeks && weeks.length > 0 && (
        <View className="mt-3 border-t border-emerald-200 pt-3">
          <Text className="mb-2 text-sm font-semibold text-slate-600">
            Formulários que serão usados
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {weeks.map((week) => (
              <View
                key={week}
                className="rounded-full border border-emerald-200 bg-white px-3 py-1"
              >
                <Text className="text-xs font-semibold text-emerald-800">
                  {week}
                </Text>
              </View>
            ))}

            {extraCount ? (
              <View className="rounded-full bg-emerald-200 px-3 py-1">
                <Text className="text-xs font-semibold text-emerald-800">
                  +{extraCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      )}
    </Pressable>
  );
}
