import React from 'react';
import { Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from '../primitives/MotiPressable';

export function EmptyState({ lottieSource, title, subtitle, ctaLabel, onCtaPress }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className="flex-1 justify-center items-center p-8"
    >
      {lottieSource && (
        <LottieView
          source={lottieSource}
          autoPlay
          loop
          style={{ width: 160, height: 160, marginBottom: 24 }}
        />
      )}
      <Text className="text-2xl font-semibold text-ink text-center mb-2">{title}</Text>
      <Text className="text-sm text-inkSub text-center mb-6">{subtitle}</Text>
      
      {ctaLabel && onCtaPress && (
        <MotiPressable
          onPress={onCtaPress}
          className="bg-peach px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold text-sm">{ctaLabel}</Text>
        </MotiPressable>
      )}
    </MotiView>
  );
}
