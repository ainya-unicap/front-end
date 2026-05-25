import { View, Text, TextInput } from 'react-native';

interface Input1Props {
    label?: string;
    placeholder?: string;
    onChangeText?: (text: string) => void;
    value?: string;
}
export default function Input1({ label, placeholder, onChangeText, value }: Input1Props) {
    return (
        <View className="">
            <Text className='text-md font-semibold text-black/70'>{label}</Text>
            <TextInput 
                placeholder={placeholder}
                onChangeText={onChangeText}
                value={value}
                className='bg-gray-100 rounded-lg px-4 py-5 mt-1 mb-4'
                secureTextEntry={label === "Senha"}
            />
        </View>
    )
}