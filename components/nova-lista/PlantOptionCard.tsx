import { Pressable, Text, View } from "react-native";

type PlantOptionCardProps = {
  name: string;
  icon: string;
  selected?: boolean;
  onPress?: () => void;
};

export function PlantOptionCard({
  name,
  icon,
  selected,
  onPress,
}: PlantOptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`relative mr-3 w-28 items-center rounded-2xl border px-3 py-4 active:opacity-80 ${
        selected
          ? "border-emerald-700 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      {selected && (
        <View className="absolute right-2 top-2 h-5 w-5 items-center justify-center rounded-full bg-emerald-700">
          <Text className="text-[10px] font-bold text-white">✓</Text>
        </View>
      )}

      <Text className="text-3xl">{icon}</Text>

      <Text className="mt-2 text-center text-sm font-semibold text-slate-700">
        {name}
      </Text>
    </Pressable>
  );
}
