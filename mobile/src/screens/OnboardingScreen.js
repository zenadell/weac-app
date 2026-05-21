import React, { useRef, useState } from "react";
import { View, Text, Dimensions, StyleSheet, Platform } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { WebView } from "react-native-webview";
import LottieView from "lottie-react-native";
import Rive from "rive-react-native";
import { MotiPressable } from "../components/primitives/MotiPressable";
import { SPLINE_SCENES } from "../lib/spline-scenes";
import { play } from "../lib/sounds";
import { useGame } from "../lib/game-store";
import { ScrollingAnimation } from "../components/ui/scrolling-animation";
import { ArrowRight } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    headline: "Welcome to The Arena.",
    sub: "Thousands of elite students are battling daily. Step up.",
    media: "custom", // Uses the new ScrollingAnimation
  },
  {
    id: "2",
    headline: "Duel anyone. Anywhere.",
    sub: "60-second exam sprints. Real opponents. High stakes.",
    media: "rive",
  },
  {
    id: "3",
    headline: "AI Prediction Engine",
    sub: "Topic predictions generated from 15 years of live exam data.",
    media: "spline",
  },
  {
    id: "4",
    headline: "Claim The Crown",
    sub: "Dominate the global leaderboards and earn Mythic relics.",
    media: "lottie",
  },
];

function Dot({ index, scrollX }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    const width = interpolate(scrollX.value, inputRange, [8, 32, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.2, 1, 0.2], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: "#FFFFFF", marginHorizontal: 4 }, animatedStyle]} />;
}

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { setProfile } = useGame();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollX.value = event.contentOffset.x; },
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
    <View className="flex-1 bg-[#121214]">
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
                  {slide.media === "custom" && <ScrollingAnimation scrollX={scrollX} index={index} />}
                  {Platform.OS !== "web" && (
                    <>
                      {slide.media === "rive" && <Rive url={""} style={{ flex: 1 }} />}
                      {slide.media === "spline" && <WebView source={{ uri: SPLINE_SCENES.AI_ORB }} style={{ flex: 1, backgroundColor: "transparent" }} />}
                      {slide.media === "lottie" && <LottieView source={require("../../assets/lottie/trophy-unlock.json")} autoPlay loop style={{ flex: 1 }} />}
                    </>
                  )}
                </MotiView>
              </View>

              {/* Text Container */}
              <View style={{ height: 160, justifyContent: "flex-end", paddingBottom: 60 }}>
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: isActive ? 1 : 0, translateY: isActive ? 0 : 20 }}
                  transition={{ delay: 200, type: "spring", damping: 20 }}
                >
                  <Text className="text-[2.5rem] font-black tracking-tight leading-[1] text-white mb-3">{slide.headline}</Text>
                </MotiView>
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: isActive ? 1 : 0, translateY: isActive ? 0 : 20 }}
                  transition={{ delay: 300, type: "spring", damping: 20 }}
                >
                  <Text className="text-[16px] font-medium text-white/60 leading-snug pr-8">{slide.sub}</Text>
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
            <Text className="text-[15px] font-bold text-white/40 uppercase tracking-widest">Skip</Text>
          </MotiPressable>
          <MotiPressable onPress={handleNext} className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-primary px-8 border border-[#FA675E]">
            <Text className="text-[17px] font-black text-[#121214]">{isLast ? "Begin Journey" : "Next"}</Text>
            {isLast && <ArrowRight size={20} color="#121214" strokeWidth={2.5} />}
          </MotiPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 48 },
  dotsContainer: { flexDirection: "row", marginBottom: 32 },
  buttonsContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 16 },
});
