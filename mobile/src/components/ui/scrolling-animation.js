import React from "react";
import { View, Image, Text, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PROFILES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=400&q=80",
  "https://images.unsplash.com/photo-1619365734050-cb5e64a42d43?w=400&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
];

export function ScrollingAnimation({ scrollX, index = 0 }) {
  // Translate the web scrollY logic to horizontal swipe progress in React Native
  const progressStyle = useAnimatedStyle(() => {
    // When the screen is fully in view, scrollX matches index * SCREEN_WIDTH.
    // As we swipe away to the next slide, the radius shrinks.
    // We reverse the logic so the circle is expanded when we are ON the slide,
    // and contracts as we swipe away.
    const distance = Math.abs(scrollX.value - (index * SCREEN_WIDTH));
    const progress = Math.max(0, 1 - distance / SCREEN_WIDTH);
    const radius = progress * 140; // Max expansion radius
    
    return { radius, opacity: progress };
  });

  return (
    <View className="flex-1 items-center justify-center">
      <View className="relative items-center justify-center">
        {/* Outer Ring */}
        <Animated.View style={useAnimatedStyle(() => ({
          width: 320, height: 320, borderRadius: 160,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
          position: "absolute",
          transform: [{ scale: 0.5 + progressStyle.value.opacity * 0.5 }],
          opacity: progressStyle.value.opacity
        }))} />

        {/* Middle Ring */}
        <Animated.View style={useAnimatedStyle(() => ({
          width: 240, height: 240, borderRadius: 120,
          borderWidth: 1, borderColor: "rgba(144,202,249,0.3)", // sky color
          position: "absolute",
          transform: [{ scale: 0.5 + progressStyle.value.opacity * 0.5 }],
          opacity: progressStyle.value.opacity
        }))} />

        {/* Center Gradient Ring */}
        <View className="w-[180px] h-[180px] rounded-full bg-[#121214] border-2 border-primary/50 items-center justify-center">
          
          {PROFILES.map((url, i) => {
            const angle = (i * Math.PI) / 4; // 8 items = 45 degrees apart
            const animatedProfileStyle = useAnimatedStyle(() => {
              const r = progressStyle.value.radius;
              const tx = r * Math.cos(angle);
              const ty = r * Math.sin(angle);
              return {
                transform: [{ translateX: tx }, { translateY: ty }, { scale: progressStyle.value.opacity }],
                opacity: progressStyle.value.opacity
              };
            });

            return (
              <Animated.View
                key={i}
                className="absolute size-14 rounded-2xl overflow-hidden border-2 border-[#121214] shadow-xl z-0"
                style={animatedProfileStyle}
              >
                <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
              </Animated.View>
            );
          })}

          {/* Center Text */}
          <Animated.View 
            className="items-center justify-center z-20 absolute inset-0"
            style={useAnimatedStyle(() => ({ opacity: progressStyle.value.opacity }))}
          >
            <Text className="text-[1.8rem] font-black text-white text-center leading-none">
              Join The
            </Text>
            <Text className="text-[1.8rem] font-black text-primary text-center leading-none mb-1">
              Arena
            </Text>
            <Text className="text-[9px] font-bold text-white/50 text-center uppercase tracking-widest px-4">
              Thousands of students battling daily.
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
