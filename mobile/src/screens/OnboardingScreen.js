import React, { useRef, useState } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { MotiPressable } from "../components/primitives/MotiPressable";
import { play } from "../lib/sounds";
import { useGame } from "../lib/game-store";
import { ScrollingAnimation } from "../components/ui/scrolling-animation";
import { ArrowRight, Swords, Sparkles, Trophy } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    headline: "Welcome to\nThe Arena.",
    sub: "Thousands of elite students are battling daily. Step up.",
    media: "custom",
    icon: null,
    iconColor: null,
  },
  {
    id: "2",
    headline: "Duel anyone.\nAnywhere.",
    sub: "60-second exam sprints against real opponents. High stakes.",
    media: "icon",
    icon: Swords,
    iconColor: "#FA675E",
  },
  {
    id: "3",
    headline: "AI Prediction\nEngine",
    sub: "Topic predictions powered by 15 years of live exam data.",
    media: "icon",
    icon: Sparkles,
    iconColor: "#CE93D8",
  },
  {
    id: "4",
    headline: "Claim\nThe Crown",
    sub: "Dominate the global leaderboards and earn Mythic relics.",
    media: "icon",
    icon: Trophy,
    iconColor: "#FFB63B",
  },
];

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
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: "#FFFFFF",
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Safe icon-based slide media for slides 2-4.
 * Uses Lucide vector icons with pulsing rings.
 */
function IconMedia({ Icon, color, isActive }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pulsing outer ring */}
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isActive ? [1, 1.3, 1] : 0.8,
          opacity: isActive ? [0.3, 0, 0.3] : 0,
        }}
        transition={{ loop: true, type: "timing", duration: 2500 }}
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: 100,
          borderWidth: 2,
          borderColor: color,
        }}
      />
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isActive ? [1, 1.5, 1] : 0.8,
          opacity: isActive ? [0.15, 0, 0.15] : 0,
        }}
        transition={{ loop: true, type: "timing", duration: 3000 }}
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 130,
          borderWidth: 1,
          borderColor: color,
        }}
      />

      {/* Central icon disc */}
      <MotiView
        from={{ scale: 0 }}
        animate={{ scale: isActive ? 1 : 0.5 }}
        transition={{ type: "spring", damping: 14 }}
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 30,
          elevation: 15,
        }}
      >
        <Icon size={60} color="#121214" strokeWidth={2} />
      </MotiView>
    </View>
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
  });

  const handleScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      try { play("swipe"); } catch {}
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      setProfile({ onboarded: true });
      navigation.navigate("Register");
    } else {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    setProfile({ onboarded: true });
    navigation.navigate("Register");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121214" }}>
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
            <View
              key={slide.id}
              style={{
                width: SCREEN_WIDTH,
                flex: 1,
                padding: 24,
                paddingTop: 80,
              }}
            >
              {/* Media Container */}
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.8,
                  }}
                  transition={{ type: "spring", damping: 18, stiffness: 280 }}
                  style={{ width: "100%", height: "80%" }}
                >
                  {slide.media === "custom" && (
                    <ScrollingAnimation scrollX={scrollX} index={index} />
                  )}
                  {slide.media === "icon" && slide.icon && (
                    <IconMedia
                      Icon={slide.icon}
                      color={slide.iconColor}
                      isActive={isActive}
                    />
                  )}
                </MotiView>
              </View>

              {/* Text Container */}
              <View
                style={{
                  height: 180,
                  justifyContent: "flex-end",
                  paddingBottom: 70,
                }}
              >
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    translateY: isActive ? 0 : 20,
                  }}
                  transition={{ delay: 200, type: "spring", damping: 20 }}
                >
                  <Text
                    style={{
                      fontSize: 38,
                      fontWeight: "900",
                      color: "#FFFFFF",
                      letterSpacing: -1,
                      lineHeight: 40,
                      marginBottom: 12,
                    }}
                  >
                    {slide.headline}
                  </Text>
                </MotiView>
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    translateY: isActive ? 0 : 20,
                  }}
                  transition={{ delay: 300, type: "spring", damping: 20 }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 24,
                      paddingRight: 32,
                    }}
                  >
                    {slide.sub}
                  </Text>
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
          <MotiPressable
            onPress={handleSkip}
            style={styles.skipBtn}
            haptic={false}
            sound={null}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Skip
            </Text>
          </MotiPressable>

          <MotiPressable
            onPress={handleNext}
            style={{
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 9999,
              backgroundColor: "#FA675E",
              paddingHorizontal: 32,
              borderWidth: 1,
              borderColor: "#FA675E",
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "900",
                color: "#121214",
              }}
            >
              {isLast ? "Begin Journey" : "Next"}
            </Text>
            {isLast && (
              <ArrowRight size={20} color="#121214" strokeWidth={2.5} />
            )}
          </MotiPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 32,
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
});
