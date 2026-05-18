
import { StyleSheet, View, Text } from 'react-native';
import { useNavigation } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import FormLogin from '@/components/forms/formLogin';
import { StatusBar } from 'expo-status-bar';

export default function ModalScreen() {
  const router = useNavigation();
  
  return (
    <View className='flex-1 items-center justify-center bg-green-900'>
      <View className='items-center flex-1 justify-center'>
        <Text className='text-2xl font-semibold text-white'>Forrage App</Text>
        <Text className='text-white'>Acompanhamento de plantas forrageiras</Text>
      </View>
      <FormLogin/>
      <StatusBar style="light" />
    </View>
  );
}
