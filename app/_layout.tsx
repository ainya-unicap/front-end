import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SWRConfig } from 'swr';

import { useColorScheme } from '@/hooks/use-color-scheme';
import "@/global.css";
import { initDatabase } from '@/database/localDb';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  initDatabase();

  return (
    <ThemeProvider value={DefaultTheme}>
      <SWRConfig
        value={{
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          dedupingInterval: 0,
          focusThrottleInterval: 300000,
        }}
      >
        <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false}} />
          <Stack.Screen name="login" options={{ headerShown: false}} />
          <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="nova-lista" options={{ headerShown: false }} />
          <Stack.Screen name="canteiros/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="relatorios/novo" options={{ headerShown: false}} />
          <Stack.Screen name="relatorios/[id]/objetivo" options={{ headerShown: false}} />
          <Stack.Screen name="relatorios/[id]/index" options={{ headerShown: false}} />
          <Stack.Screen name="relatorios/[id]/desenvolvimento" options={{ headerShown: false}} />
          
        </Stack>
      </SWRConfig>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
