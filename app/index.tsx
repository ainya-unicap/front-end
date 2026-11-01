import React, { useEffect, useState } from 'react';
import { View, Text, Image, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { getRefreshToken, getUserId, logout } from '@/database/auth';
import { getProfile } from '@/database/user';

const { width } = Dimensions.get('window');

// Só abre direto no app se existir uma sessão salva E o servidor ainda a
// reconhecer; sem isso (primeiro acesso, conta apagada, sessão expirada ou
// revogada) vai para o login, limpando o que sobrou no aparelho.
async function decidirRota(): Promise<'/(tabs)' | '/login'> {
  if (!getRefreshToken() || !getUserId()) return '/login';

  try {
    await getProfile();
    return '/(tabs)';
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;

    // Sem resposta do servidor (offline): mantém a sessão e deixa as telas
    // mostrarem o erro de conexão
    if (status === undefined) return '/(tabs)';

    await logout();
    return '/login';
  }
}

export default function SplashScreen() {
  const router = useRouter();
  const [progressAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // A checagem roda junto com a animação, sem alongar a espera
    const rota = decidirRota();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(async () => {
      router.replace(await rota);
    });
  }, [router, progressAnim]);

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="flex-1 bg-[#0A4D2E] items-center justify-center px-6">
      {/* Bloco de Marca Central */}
      <View className="items-center justify-center">
        {/* Logo ampliada com destaque */}
        <Image
          source={require('@/assets/images/logo-splash.png')}
          style={{ width: width * 0.68, height: width * 0.68 }}
          resizeMode="contain"
        />

        {/* Nome do App com margem negativa para aproximar do círculo */}
        <Text
          style={{ fontSize: 38, marginTop: -16 }}
          className="text-white font-bold tracking-tight mb-2"
        >
          Forrageia
        </Text>

        {/* Slogan */}
        <Text
          style={{ fontSize: 18 }}
          className="text-[#E2E8F0] font-medium tracking-wide"
        >
          Cultive. Registre. Aprenda
        </Text>
      </View>

      {/* Barra de Progresso */}
      <View
        style={{ width: width * 0.65, height: 8 }}
        className="bg-white/20 rounded-full overflow-hidden mt-10"
      >
        <Animated.View
          style={{ width: progressBarWidth }}
          className="h-full bg-[#E5A93C] rounded-full"
        />
      </View>
    </View>
  );
}