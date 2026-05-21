import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Math.min(Dimensions.get('window').width, 480);

/**
 * A single item on the wheel, extracted into its own component
 * so useAnimatedStyle is called at the top level (Rules of Hooks safe).
 */
function RadialItem({ child, index, count, radius, itemSize, scrollY }) {
  const baseAngleDeg = (index / count) * 360;

  const style = useAnimatedStyle(() => {
    // Map scroll to rotation: 1200px scroll = full 360°
    const scrollRotation = interpolate(
      scrollY.value,
      [0, 1200],
      [0, 360],
      Extrapolation.EXTEND
    );

    // This item's current angle (in degrees) including scroll rotation
    // Subtract 90 so index 0 starts at the TOP (12 o'clock)
    const currentAngleDeg = baseAngleDeg + scrollRotation - 90;
    const currentAngleRad = (currentAngleDeg * Math.PI) / 180;

    // Position on the circle
    const x = radius * Math.cos(currentAngleRad);
    const y = radius * Math.sin(currentAngleRad);

    // Normalize angle to 0-360 to determine visibility
    // Items near the top (y < 0) are visible, items at the bottom (y > 0) are hidden
    const normalizedDeg = ((currentAngleDeg % 360) + 360) % 360;

    // Distance from the top position (270° in standard math coords = top)
    // Actually our top is at -90° offset, so top items have y < 0
    // Use y directly: y < 0 means visible (above center), y > 0 means below
    const verticalProgress = y / radius; // -1 (top) to +1 (bottom)

    // Fade out items as they go below the horizon
    const opacity = interpolate(
      verticalProgress,
      [-1, -0.2, 0.3, 0.8],
      [1, 1, 0.4, 0],
      Extrapolation.CLAMP
    );

    // Scale: biggest at top, smaller toward bottom
    const scale = interpolate(
      verticalProgress,
      [-1, 0, 0.5],
      [1.05, 0.9, 0.7],
      Extrapolation.CLAMP
    );

    // Z-ordering: items at top should be in front
    const zIndex = Math.round(interpolate(
      verticalProgress,
      [-1, 1],
      [100, 0],
      Extrapolation.CLAMP
    ));

    return {
      position: 'absolute',
      width: itemSize,
      height: itemSize,
      // Center the item on its computed position
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
 *
 * A scroll-driven rotating wheel. Items are arranged in a circle.
 * The circle's center is pushed to the bottom of the visible container,
 * so only the top arc of items is visible — like a Ferris wheel rising
 * from below the fold.
 *
 * scrollY: Reanimated shared value tracking vertical scroll offset.
 */
export function RadialScrollGallery({
  children,
  scrollY,
  radius = SCREEN_WIDTH * 0.48,
  itemSize = 150,
  visibleHeight,
}) {
  const childrenArray = React.Children.toArray(children);
  const count = childrenArray.length;

  // The visible height of the gallery container.
  // We show about 60% of the circle above the "horizon".
  const containerHeight = visibleHeight || radius * 1.4 + itemSize;

  return (
    <View
      style={{
        width: '100%',
        height: containerHeight,
        overflow: 'hidden',
        alignItems: 'center',
      }}
    >
      {/*
        This inner View acts as the coordinate origin for the circle.
        By positioning it at the bottom-center of the container,
        the top arc of the circle is visible and the bottom is clipped.
      */}
      <View
        style={{
          position: 'absolute',
          bottom: -(radius * 0.5), // Push center down so top arc is prominent
          left: '50%',
          marginLeft: 0, // We center items via left offset in RadialItem
          width: 0,
          height: 0,
          // This 0x0 view is the origin. All children position absolutely from here.
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
