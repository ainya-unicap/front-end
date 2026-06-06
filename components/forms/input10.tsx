import { View, Text, TextInput } from "react-native";

export default function Input10({ label, value, onChangeText }: { label: string, value: string, onChangeText: (text: string) => void }) {
    return (
        <View className="mb-6">
            <Text className="text-[11px] font-bold text-gray-400 mb-2 tracking-wider">{label}</Text>
            <TextInput
                className="bg-white rounded-xl p-4 text-gray-700 text-base border border-gray-200"
                style={{ minHeight: 180, textAlignVertical: 'top' }}
                multiline
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    )
}