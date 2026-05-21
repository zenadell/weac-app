import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
  cancelAnimation,
  runOnJS
} from 'react-native-reanimated';
import { onBurst } from '../../lib/confetti';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = ['#FF9E80', '#F06292', '#80CBC4', '#FFF176', '#90CAF9', '#CE93D8'];
const PARTICLES = 60;

function Particle({ progress, originX, originY, index }) {
  const angle = (Math.PI * 2 * index) / PARTICLES + (Math.random() * 0.5);
  const velocity = 200 + Math.random() * 400;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = 4 + Math.random() * 6;

  const x = useDerivedValue(() => {
    return originX + Math.cos(angle) * velocity * progress.value;
  });

  const y = useDerivedValue(() => {
    const gravity = 400 * progress.value * progress.value;
    return originY + Math.sin(angle) * velocity * progress.value + gravity;
  });

  const opacity = useDerivedValue(() => {
    return 1 - Math.pow(progress.value, 3); // fade out at the end
  });

  return (
    <Group opacity={opacity}>
      <Circle cx={x} cy={y} r={size} color={color} />
    </Group>
  );
}

function Burst({ origin, onComplete }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: 2500, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }
    );
    return () => cancelAnimation(progress);
  }, []);

  const particles = Array.from({ length: PARTICLES }).map((_, i) => (
    <Particle
      key={i}
      index={i}
      progress={progress}
      originX={origin.x * SCREEN_WIDTH}
      originY={origin.y * SCREEN_HEIGHT}
    />
  ));

  return <>{particles}</>;
}

export function Confetti() {
  const [bursts, setBursts] = React.useState([]);

  useEffect(() => {
    const unsubscribe = onBurst(({ x, y }) => {
      const id = Math.random().toString();
      setBursts((prev) => [...prev, { id, x, y }]);
    });
    return unsubscribe;
  }, []);

  const handleComplete = (id) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  };

  if (bursts.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" className="z-50 elevation-10">
      <Canvas style={StyleSheet.absoluteFill}>
        {bursts.map((burst) => (
          <Burst
            key={burst.id}
            origin={{ x: burst.x, y: burst.y }}
            onComplete={() => handleComplete(burst.id)}
          />
        ))}
      </Canvas>
    </View>
  );
}
