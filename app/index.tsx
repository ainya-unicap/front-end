import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      router.replace('/login');
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