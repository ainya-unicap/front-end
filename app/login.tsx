import { Link } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useNavigation } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  const router = useNavigation();
  
  return (
    <View className='flex-1 items-center justify-center bg-green-900'>
      <Text className='text-2xl font-semibold text-white'>Forrage App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
