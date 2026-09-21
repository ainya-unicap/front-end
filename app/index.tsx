import { View, Text, Image, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. A barra enche em 2.5 segundos (um pouco antes de mudar de tela)
    Animated.timing(progress, {
      toValue: 100,
      duration: 2500, 
      useNativeDriver: false,
    }).start();

    // 2. A tela muda em 3 segundos
    const timer = setTimeout(() => {
      router.replace('/login'); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const widthPercentage = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View className="flex-1 items-center justify-center bg-primary">

      <Image 
        source={require('../assets/images/logo-splash.png')} 
        className="w-32 h-32 mb-4" 
        resizeMode="contain"
      />

      <Text className="text-white text-5xl font-bold mb-2">
        Forrageia
      </Text>

      <Text className="text-white text-base mb-12">
        Cultive. Registre. Aprenda
      </Text>

      {/* Barra de Fundo Branca (Aumentei a altura para h-2 para ficar mais visível) */}
      <View className="w-48 h-2 bg-white rounded-full overflow-hidden">
        {/* Passamos a cor e o tamanho diretamente pro style para não falhar na Web */}
        <Animated.View 
          style={{ 
            height: '100%', 
            backgroundColor: '#D4A373', // Nossa cor accent
            width: widthPercentage 
          }} 
        />
      </View>

    </View>
  );
}