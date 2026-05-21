import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

/**
 * RadialScrollGallery
 * 
 * A pinned, rotating wheel gallery for React Native.
 * Uses `scrollY` to drive rotation, while pinning the container 
 * so it stays in the viewport during the scroll.
 */
export function RadialScrollGallery({ 
  children, 
  scrollY, 
  radius = width * 0.55, // Adjusted for mobile screens
  itemSize = 140, 
}) {
  const childrenArray = React.Children.toArray(children);
  const count = childrenArray.length;
  const angleStep = (2 * Math.PI) / count;

  // Pin the container by translating it downwards by the exact amount the user scrolled
  // We only pin it once it reaches the top of the screen (approx offset 150)
  const pinStyle = useAnimatedStyle(() => {
    // Keep it pinned by countering the scroll offset
    const translateY = Math.max(0, scrollY.value);
    return {
      transform: [{ translateY }],
    };
  });

  // Main container rotation based on scroll
  const containerStyle = useAnimatedStyle(() => {
    // 1500px of scroll = 360deg rotation
    const rotation = interpolate(
      scrollY.value, 
      [0, 1500], 
      [0, 360],
      Extrapolation.EXTEND
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return (
    <Animated.View style={[{ 
      width: '100%', 
      height: radius * 2 + itemSize * 2, 
      alignItems: 'center', 
      justifyContent: 'center',
    }, pinStyle]}>
      
      <Animated.View style={[
        {
          width: radius * 2,
          height: radius * 2,
          position: 'relative',
        },
        containerStyle
      ]}>
        {childrenArray.map((child, index) => {
          const angle = index * angleStep;
          
          // Position items along the edge of the circle
          // Subtract Math.PI/2 to start at the top (12 o'clock)
          const x = radius + radius * Math.cos(angle - Math.PI / 2) - itemSize / 2;
          const y = radius + radius * Math.sin(angle - Math.PI / 2) - itemSize / 2;

          // Counter-rotate each item so they stay upright
          const itemStyle = useAnimatedStyle(() => {
            const rotation = interpolate(
              scrollY.value, 
              [0, 1500], 
              [0, -360],
              Extrapolation.EXTEND
            );
            
            // Highlight the item closest to the top (12 o'clock)
            // Calculate current global angle of this item
            const currentAngleDeg = (rotation + (angle * 180 / Math.PI)) % 360;
            const normalizedAngle = currentAngleDeg < 0 ? currentAngleDeg + 360 : currentAngleDeg;
            
            // The item at the top is at 0 degrees (or 360)
            const distFromTop = Math.min(normalizedAngle, 360 - normalizedAngle);
            const scale = interpolate(distFromTop, [0, 45, 90], [1.1, 0.8, 0.6], Extrapolation.CLAMP);
            const opacity = interpolate(distFromTop, [0, 60, 120], [1, 0.5, 0], Extrapolation.CLAMP);

            return {
              position: 'absolute',
              left: x,
              top: y,
              width: itemSize,
              height: itemSize,
              opacity,
              transform: [
                { rotate: `${rotation}deg` },
                { scale }
              ],
            };
          });

          return (
            <Animated.View key={index} style={itemStyle}>
              {child}
            </Animated.View>
          );
        })}
      </Animated.View>

    </Animated.View>
  );
}
