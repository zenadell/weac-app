import React from "react";
import { View, Image, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

const SCREEN_WIDTH = require("react-native").Dimensions.get("window").width;

const PROFILES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60",
  "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=200&q=60",
  "https://images.unsplash.com/photo-1619365734050-cb5e64a42d43?w=200&q=60",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=60",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=60",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=60",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=60",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60",
];

/**
 * Individual avatar that expands outward from center.
 * Extracted into its own component so useAnimatedStyle is called
 * at the top level of a component (satisfying Rules of Hooks).
 */
function ExpandingAvatar({ uri, angle, progress }) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const r = p * 130;
    return {
      position: "absolute",
      width: 52,
      height: 52,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "#121214",
      transform: [
        { translateX: r * Math.cos(angle) },
        { translateY: r * Math.sin(angle) },
        { scale: Math.max(0.01, p) },
      ],
      opacity: p,
    };
  });

  return (
    <Animated.View style={style}>
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

export function ScrollingAnimation({ scrollX, index = 0 }) {
  const progress = useDerivedValue(() => {
    "worklet";
    const distance = Math.abs(scrollX.value - index * SCREEN_WIDTH);
    return Math.max(0, 1 - distance / SCREEN_WIDTH);
  });

  const ringOuterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.5 + progress.value * 0.5 }],
    opacity: progress.value,
  }));

  const ringInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
    opacity: progress.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 340,
          height: 340,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer Ring */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: 160,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            },
            ringOuterStyle,
          ]}
        />

        {/* Middle Ring */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: 120,
              borderWidth: 1,
              borderColor: "rgba(250,103,94,0.25)",
            },
            ringInnerStyle,
          ]}
        />

        {/* Center disc */}
        <View
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: "#121214",
            borderWidth: 2,
            borderColor: "rgba(250,103,94,0.4)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Avatars (each in its own component → hooks-safe) */}
          {PROFILES.map((uri, i) => (
            <ExpandingAvatar
              key={i}
              uri={uri}
              angle={(i * Math.PI) / 4}
              progress={progress}
            />
          ))}

          {/* Center text */}
          <Animated.View
            style={[
              {
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
              },
              textStyle,
            ]}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#FFFFFF",
                textAlign: "center",
                lineHeight: 28,
              }}
            >
              Join The
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#FA675E",
                textAlign: "center",
                lineHeight: 28,
                marginBottom: 4,
              }}
            >
              Arena
            </Text>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                color: "rgba(255,255,255,0.45)",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                paddingHorizontal: 16,
              }}
            >
              Thousands battling daily
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
