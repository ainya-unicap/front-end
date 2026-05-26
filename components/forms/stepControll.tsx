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
            <TouchableOpacity onPress={() => router.back()} className="bg-white/20 p-4 rounded-full overflow-hidden">
                <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill}/>
                <ChevronLeftIcon color="white"/>
            </TouchableOpacity>
            {nextStep && (
                <TouchableOpacity onPress={nextStep} className="bg-white/20 p-4 rounded-full overflow-hidden">
                    <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill}/>
                    <ChevronRightIcon color="white"/>
                </TouchableOpacity>
            )}
        </View>
    );
}