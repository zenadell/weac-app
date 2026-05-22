import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Math.min(Dimensions.get('window').width, 480);

/**
 * A single item on the wheel, extracted so useAnimatedStyle is hooks-safe.
 */
function RadialItem({ child, index, count, radius, itemSize, scrollY }) {
  const baseAngleDeg = (index / count) * 360;

  const style = useAnimatedStyle(() => {
    // Map scroll to rotation: 800px of gesture = full 360°
    const scrollRotation = interpolate(
      scrollY.value,
      [0, 800],
      [0, 360],
      Extrapolation.EXTEND
    );

    const currentAngleDeg = baseAngleDeg + scrollRotation - 90;
    const currentAngleRad = (currentAngleDeg * Math.PI) / 180;

    const x = radius * Math.cos(currentAngleRad);
    const y = radius * Math.sin(currentAngleRad);

    const verticalProgress = y / radius; // -1 (top) to +1 (bottom)

    const opacity = interpolate(
      verticalProgress,
      [-1, -0.3, 0.2, 0.6],
      [1, 1, 0.5, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      verticalProgress,
      [-1, -0.5, 0, 0.5],
      [1.08, 1, 0.88, 0.7],
      Extrapolation.CLAMP
    );

    const zIndex = Math.round(
      interpolate(verticalProgress, [-1, 1], [100, 0], Extrapolation.CLAMP)
    );

    return {
      position: 'absolute',
      width: itemSize,
      height: itemSize,
      left: x - itemSize / 2,
      top: y - itemSize / 2,
      opacity,
      zIndex,
      transform: [{ scale }],
    };
  });

  return <Animated.View style={style}>{child}</Animated.View>;
}

/**
 * RadialScrollGallery
 */
export function RadialScrollGallery({
  children,
  scrollY,
  radius = SCREEN_WIDTH * 0.42,
  itemSize = 140,
}) {
  const childrenArray = React.Children.toArray(children);
  const count = childrenArray.length;

  const containerHeight = radius * 1.2 + itemSize;

  return (
    <View
      style={{
        width: '100%',
        height: containerHeight,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          width: 0,
          height: 0,
          marginBottom: -(radius * 0.35),
        }}
      >
        {childrenArray.map((child, index) => (
          <RadialItem
            key={index}
            child={child}
            index={index}
            count={count}
            radius={radius}
            itemSize={itemSize}
            scrollY={scrollY}
          />
        ))}
      </View>
    </View>
  );
}
