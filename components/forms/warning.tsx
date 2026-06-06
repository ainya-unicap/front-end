import { View, Text } from "react-native";

export default function Warning({ text }: { text: string }) {
    return (
        <View className="flex-row items-start mb-6 border-l-[3px] border-[#166534] pl-3 ml-1">
          <Text className="text-gray-600 flex-1 text-[13px] leading-5">
            {text}
          </Text>
        </View>
    )
}