import { Pressable, Text, View } from "react-native";

export function PhotoUploadBox() {
  return (
    <View>
      <Pressable className="h-36 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 active:opacity-80">
        <Text className="text-4xl">📸</Text>

        <Text className="mt-2 text-base font-bold text-emerald-900">
          Tirar foto ou enviar
        </Text>

        <Text className="mt-1 text-center text-sm text-slate-400">
          Data e hora adicionadas automaticamente
        </Text>
      </Pressable>

      <View className="mt-4 flex-row gap-2">
        <View className="h-14 w-14 items-center justify-center rounded-lg bg-emerald-100">
          <Text className="text-xl">🌱</Text>
        </View>

        <View className="h-14 w-14 items-center justify-center rounded-lg bg-emerald-100">
          <Text className="text-xl">🌿</Text>
        </View>

        <View className="h-14 w-14 items-center justify-center rounded-lg bg-emerald-100">
          <Text className="text-xl">🌾</Text>
        </View>
      </View>
    </View>
  );
}