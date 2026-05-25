import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import "@/global.css";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false}} />
        <Stack.Screen name="login" options={{ headerShown: false}} />
        <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="relatorios/[id]/index" options={{ title: 'Relatório' }} />
        <Stack.Screen name="relatorios/[id]/desenvolvimento" options={{ title: 'Sessão 3 - Desenvolvimento' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
