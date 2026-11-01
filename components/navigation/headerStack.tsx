import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons';

export default function HeaderStack({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
    const router = useRouter();
    return (
        <View className="flex-row items-center mb-8 w-full" style={{ marginTop: insets.top + 8 }}>
            <TouchableOpacity
                onPress={() => router.back()}
                className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
                <AntDesign name="left" size={16} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-[#0f172a] ml-4">{title}</Text>
        </View>
    )
}