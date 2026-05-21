/**
 * ExpandingAvatarRing
 *
 * React Native translation of the web "scrolling-animation" component.
 * Instead of window.scrollY (which doesn't exist in RN), this version
 * auto-animates on a timed loop using Reanimated shared values.
 *
 * Usage:
 *   <ExpandingAvatarRing
 *     isActive={true}
 *     centerTitle="Searching"
 *     centerSubtitle="Finding a worthy opponent"
 *     avatarUrls={[...]}        // optional override
 *     accentColor="#FA675E"      // optional
 *   />
 */
import React, { useEffect } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60",
  "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=200&q=60",
  "https://images.unsplash.com/photo-1619365734050-cb5e64a42d43?w=200&q=60",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=60",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=60",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=60",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=60",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60",
];

// ── Individual avatar (own component → hooks-safe) ──────────────────
function ExpandingAvatar({ uri, angle, progress, accentColor }) {
  const style = useAnimatedStyle(() => {
    const r = interpolate(progress.value, [0, 1], [0, 130]);
    const s = interpolate(progress.value, [0, 0.3, 1], [0.3, 1, 1]);
    const o = interpolate(progress.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0.6]);
    return {
      transform: [
        { translateX: r * Math.cos(angle) },
        { translateY: r * Math.sin(angle) },
        { scale: s },
      ],
      opacity: o,
    };
  });

  return (
    <Animated.View style={[styles.avatar, { borderColor: accentColor }, style]}>
      <Image source={{ uri }} style={styles.avatarImage} resizeMode="cover" />
    </Animated.View>
  );
}

// ── Pulsing ring (own component → hooks-safe) ───────────────────────
function PulsingRing({ size, delay, borderColor, progress }) {
  const style = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.6, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0.4, 0.08]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor,
        },
        style,
      ]}
    />
  );
}

// ── Main component ──────────────────────────────────────────────────
export function ExpandingAvatarRing({
  isActive = true,
  centerTitle = "Searching",
  centerSubtitle = "Finding a worthy opponent",
  avatarUrls,
  accentColor = "#FA675E",
}) {
  const urls = avatarUrls || DEFAULT_AVATARS;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Breathe: expand out → hold → collapse → hold → repeat
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2200, easing: Easing.out(Easing.cubic) }),
          withDelay(800, withTiming(0, { duration: 1800, easing: Easing.in(Easing.cubic) })),
          withDelay(400, withTiming(0, { duration: 0 })) // pause at center
        ),
        -1, // infinite
        false
      );
    } else {
      progress.value = withTiming(0, { duration: 600 });
    }
  }, [isActive]);

  // Gradient ring glow animation
  const glowStyle = useAnimatedStyle(() => {
    const s = interpolate(progress.value, [0, 0.5, 1], [1, 1.05, 1.02]);
    return { transform: [{ scale: s }] };
  });

  // Center text fade
  const textStyle = useAnimatedStyle(() => {
    const o = interpolate(progress.value, [0, 0.4, 0.7, 1], [0.3, 1, 1, 0.5]);
    const ty = interpolate(progress.value, [0, 0.5, 1], [8, 0, 4]);
    return { opacity: o, transform: [{ translateY: ty }] };
  });

  return (
    <View style={styles.container}>
      {/* Outer decorative rings */}
      <PulsingRing
        size={320}
        borderColor="rgba(255,255,255,0.06)"
        progress={progress}
      />
      <PulsingRing
        size={260}
        borderColor={accentColor + "30"}
        progress={progress}
      />

      {/* Gradient border ring (the main visible circle) */}
      <Animated.View style={[styles.gradientRing, { borderColor: accentColor + "60" }, glowStyle]}>
        {/* Inner dark disc */}
        <View style={styles.innerDisc}>
          {/* Expanding avatars */}
          {urls.map((uri, i) => (
            <ExpandingAvatar
              key={i}
              uri={uri}
              angle={(i * 2 * Math.PI) / urls.length}
              progress={progress}
              accentColor={accentColor}
            />
          ))}

          {/* Center text */}
          <Animated.View style={[styles.centerText, textStyle]}>
            <Text style={[styles.title, { color: "#FFFFFF" }]}>
              {centerTitle}
            </Text>
            <Text style={[styles.subtitle, { color: "rgba(255,255,255,0.45)" }]}>
              {centerSubtitle}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    // Neon glow
    shadowColor: "#FA675E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  innerDisc: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#121214",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 3,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 6,
    lineHeight: 14,
  },
});
