import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LightTheme, DarkTheme } from '../constants/DesignTokens';

const SkeletonLoader = ({ width, height, borderRadius = 8, style }) => {
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#334155' : '#E2E8F0',
          opacity,
        },
        style,
      ]}
    />
  );
};

export default SkeletonLoader;
