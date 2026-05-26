import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useRouter } from 'expo-router';
import { ChevronLeftIcon, ChevronRight, ChevronRightIcon } from 'lucide-react-native';
import { BlurView } from "expo-blur";
interface StepControlProps {
    nextStep?: () => void;
}

export default function StepControl({ nextStep }: StepControlProps) {
    const router = useRouter();

    return (
        <View className="flex-row items-center absolute bottom-4 right-4 z-10 gap-2">
            <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 border border-gray-300 shadow-md p-4 rounded-full overflow-hidden">
                <ChevronLeftIcon color="gray"/>
            </TouchableOpacity>
            {nextStep && (
                <TouchableOpacity onPress={nextStep} className="bg-green-900 border border-green-900 shadow-md py-4 px-6 rounded-full overflow-hidden flex-row items-center gap-1 justify-center">
                    <Text className="text-white font-bold">Próximo</Text>
                    <ChevronRightIcon color="white"/>
                </TouchableOpacity>
            )}
        </View>
    );
}