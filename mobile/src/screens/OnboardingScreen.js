import React, { useRef, useState } from "react";
import { View, Text, Dimensions, StyleSheet, Platform } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolateColor,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { WebView } from "react-native-webview";
import LottieView from "lottie-react-native";
import Rive from "rive-react-native";
import { MotiPressable } from "../components/primitives/MotiPressable";
import { SPLINE_SCENES } from "../lib/spline-scenes";
import Gradient from "../components/Gradient";
import { play } from "../lib/sounds";

import { useGame } from "../lib/game-store";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    headline: "Duel anyone. Anywhere.",
    sub: "60-second exam sprints. Real opponents. Real stakes.",
    gradient: "peach",
    media: "rive",
  },
  {
    id: "2",
    headline: "AI sees the future",
    sub: "Topic predictions from 15 years of exam data.",
    gradient: "lilac",
    media: "spline",
  },
  {
    id: "3",
    headline: "Climb your school.",
    sub: "Rep your school. Win seasons. Collect Mythic cards.",
    gradient: "mint",
    media: "lottie",
  },
];

const GRADIENT_COLORS = {
  peach: ["#FF9E80", "#F06292"],
  lilac: ["#CE93D8", "#9575CD"],
  mint: ["#80CBC4", "#4DB6AC"],
};

function Dot({ index, scrollX }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 32, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.2, 1, 0.2],
      Extrapolation.CLAMP
    );

    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        { height: 8, borderRadius: 4, backgroundColor: "#1B1A2E", marginHorizontal: 4 },
        animatedStyle,
      ]}
    />
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { setProfile } = useGame();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {}
  });

  const handleScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      play("swipe");
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      setProfile({ onboarded: true });
      navigation.navigate("Register");
    } else {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * SCREEN_WIDTH, animated: true });
    }
  };

  const handleSkip = () => {
    setProfile({ onboarded: true });
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      {/* Background transitions */}
      <Animated.View style={StyleSheet.absoluteFill}>
        {SLIDES.map((s, i) => (
          <View key={s.id} style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: currentIndex === i ? 1 : 0 }]}>
              <Gradient name={s.gradient} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
        ))}
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, index) => {
          const isActive = currentIndex === index;
          return (
            <View key={slide.id} style={{ width: SCREEN_WIDTH, flex: 1, padding: 24, paddingTop: 64 }}>
              {/* Media Container */}
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
                  transition={{ type: "spring", damping: 18, stiffness: 280 }}
                  style={{ width: "100%", height: "80%" }}
                >
                  {Platform.OS === 'web' ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 32 }}>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1B1A2E', opacity: 0.6 }}>
                        [{slide.media.toUpperCase()}]
                      </Text>
                      <Text style={{ fontSize: 14, color: '#1B1A2E', opacity: 0.5, marginTop: 8 }}>
                        (Native device required)
                      </Text>
                    </View>
                  ) : (
                    <>
                      {slide.media === "rive" && (
                        <Rive url={""} style={{ flex: 1 }} />
                      )}
                      {slide.media === "spline" && (
                        <WebView source={{ uri: SPLINE_SCENES.AI_ORB }} style={{ flex: 1, backgroundColor: "transparent" }} />
                      )}
                      {slide.media === "lottie" && (
                        <LottieView source={require("../../assets/lottie/trophy-unlock.json")} autoPlay loop style={{ flex: 1 }} />
                      )}
                    </>
                  )}
                </MotiView>
              </View>

              {/* Text Container */}
              <View style={{ height: 160, justifyContent: "flex-end", paddingBottom: 40 }}>
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: isActive ? 1 : 0, translateY: isActive ? 0 : 20 }}
                  transition={{ delay: 200, type: "spring", damping: 20 }}
                >
                  <Text style={styles.headline}>{slide.headline}</Text>
                </MotiView>
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: isActive ? 1 : 0, translateY: isActive ? 0 : 20 }}
                  transition={{ delay: 300, type: "spring", damping: 20 }}
                >
                  <Text style={styles.sub}>{slide.sub}</Text>
                </MotiView>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          <MotiPressable onPress={handleSkip} style={styles.skipBtn} haptic={false} sound={null}>
            <Text style={styles.skipText}>Skip</Text>
          </MotiPressable>
          <MotiPressable onPress={handleNext} style={styles.nextBtn}>
            <Text style={styles.nextText}>{isLast ? "Get started →" : "Next"}</Text>
          </MotiPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF8F0",
  },
  headline: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1B1A2E",
    marginBottom: 12,
    lineHeight: 40,
  },
  sub: {
    fontSize: 16,
    color: "#1B1A2E",
    opacity: 0.8,
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 48,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1A2E",
    opacity: 0.6,
  },
  nextBtn: {
    backgroundColor: "#1B1A2E",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
