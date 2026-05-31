import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

interface Input1Props {
    label?: string;
    placeholder?: string;
    onChangeText?: (text: string) => void;
    value?: string;
    items?: ItemType<string>[];
    setValue?: (value: string | null) => void;
}

export default function Input1({ label, placeholder, onChangeText, value, items, setValue }: Input1Props) {
    const [open, setOpen] = useState(false);
    const [instituicaoValue, setInstituicaoValue] = useState(value || null);
    const [instituicaoItems, setInstituicaoItems] = useState(items || []);
    return (
        <View className="">
            <Text className='text-md font-semibold text-black/70'>{label}</Text>
            <TextInput
                placeholder={placeholder}
                onChangeText={onChangeText}
                value={value}
                className='bg-gray-100 rounded-lg px-4 py-5 mt-1 mb-4'
                secureTextEntry={label === "Senha" || label === "Confirmar Senha"}
            />

        </View>
    )
}