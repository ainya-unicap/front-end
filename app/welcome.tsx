import { Link } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect } from 'react';

export default function ModalScreen() {
  const router = useRouter();
  setTimeout(() => router.push("/login"), 5000)

  return (
    <View className='flex-1 items-center justify-center'>
      <Text>Bem Vindo!</Text>
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
