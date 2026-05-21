import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

/**
 * RadialScrollGallery
 * React Native implementation of a scroll-driven radial gallery.
 * Maps the provided `scrollY` shared value to a rotation effect.
 */
export function RadialScrollGallery({ 
  children, 
  scrollY, 
  radius = width * 0.8, // Default radius based on screen width
  itemSize = 100, 
  visiblePercentage = 50 
}) {
  const childrenArray = React.Children.toArray(children);
  const count = childrenArray.length;
  const angleStep = (2 * Math.PI) / count;

  // Main container rotation based on scroll
  const containerStyle = useAnimatedStyle(() => {
    // 1000px of scroll = 360deg rotation (1 full circle)
    const rotation = interpolate(scrollY.value, [0, 1000], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return (
    <View style={{ 
      width: '100%', 
      height: radius * (visiblePercentage / 100) * 2 + itemSize, 
      alignItems: 'center', 
      overflow: 'hidden' 
    }}>
      <Animated.View style={[
        {
          width: radius * 2,
          height: radius * 2,
          position: 'absolute',
          top: itemSize / 2, // Push it down so the top items are visible
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
            const rotation = interpolate(scrollY.value, [0, 1000], [0, -360]);
            return {
              position: 'absolute',
              left: x,
              top: y,
              width: itemSize,
              height: itemSize,
              transform: [{ rotate: `${rotation}deg` }],
            };
          });

          return (
            <Animated.View key={index} style={itemStyle}>
              {child}
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}
