import { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle, DimensionValue } from "react-native";

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

// Bloco com animação de "pulso" usado como placeholder enquanto os dados carregam.
export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: "#e2e8f0",
          opacity,
        },
        style,
      ]}
    />
  );
}
