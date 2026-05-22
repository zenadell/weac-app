import React, { useRef, useState, useEffect } from "react";
import { View, Text, Dimensions, StyleSheet, Pressable } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedRef,
} from "react-native-reanimated";
import { play } from "../lib/sounds";
import { useGame } from "../lib/game-store";
import { ScrollingAnimation } from "../components/ui/scrolling-animation";
import { ArrowRight, Swords, Sparkles, Trophy } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    headline: "Welcome to\nThe Arena.",
    sub: "Thousands of elite students are battling daily. Step up.",
    media: "custom",
  },
  {
    id: "2",
    headline: "Duel anyone.\nAnywhere.",
    sub: "60-second exam sprints against real opponents. High stakes.",
    media: "icon",
    icon: Swords,
    color: "#FA675E",
  },
  {
    id: "3",
    headline: "AI Prediction\nEngine",
    sub: "Topic predictions powered by 15 years of live exam data.",
    media: "icon",
    icon: Sparkles,
    color: "#30C5A0",
  },
  {
    id: "4",
    headline: "Claim\nThe Crown",
    sub: "Dominate the global leaderboards and earn Mythic relics.",
    media: "icon",
    icon: Trophy,
    color: "#FFB63B",
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
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
    const backgroundColor = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP) > 0.5 ? '#FFF' : '#FFF';

    return { width, opacity, backgroundColor };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
    />
  );
}

function PulseIcon({ Icon, color, isActive }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1, // infinite loop
        true
      );
    } else {
      pulse.value = withTiming(0);
    }
  }, [isActive, pulse]);

  const ring1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.4]) }],
      opacity: interpolate(pulse.value, [0, 1], [0.4, 0]),
    };
  });

  const ring2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.8]) }],
      opacity: interpolate(pulse.value, [0, 1], [0.15, 0]),
    };
  });

  return (
    <View style={styles.iconMediaContainer}>
      {/* Outer Pulse */}
      <Animated.View style={[styles.ring, { borderColor: color, width: 220, height: 220, borderRadius: 110 }, ring2Style]} />
      {/* Inner Pulse */}
      <Animated.View style={[styles.ring, { borderColor: color, width: 150, height: 150, borderRadius: 75 }, ring1Style]} />
      
      <MotiView
        animate={{
          scale: isActive ? 1 : 0.5,
          backgroundColor: isActive ? color : 'rgba(255,255,255,0.05)',
        }}
        transition={{ type: 'spring', damping: 14 }}
        style={[
          styles.iconDisc, 
          isActive && { shadowColor: color, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 15 }
        ]}
      >
        <Icon size={56} color={isActive ? "#000" : "rgba(255,255,255,0.2)"} strokeWidth={2.5} />
      </MotiView>
    </View>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { setProfile } = useGame();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useAnimatedRef();

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
  const currentSlide = SLIDES[currentIndex];
  const activeColor = currentSlide.color || '#FFF';

  const handleNext = () => {
    if (isLast) {
      setProfile({ onboarded: true });
      navigation.navigate("Register");
    } else {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    setProfile({ onboarded: true });
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      {/* Subtle Background Glow behind the scrollview based on slide color */}
      <MotiView
        animate={{ backgroundColor: activeColor }}
        transition={{ type: 'timing', duration: 800 }}
        style={styles.ambientGlow}
      />

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        style={{ flex: 1, zIndex: 10 }}
        contentContainerStyle={{ width: SCREEN_WIDTH * SLIDES.length }}
      >
        {SLIDES.map((slide, index) => {
          const isActive = currentIndex === index;
          return (
            <View key={slide.id} style={styles.slide}>
              
              {/* Media Section */}
              <View style={styles.mediaSection}>
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.8,
                  }}
                  transition={{ type: "spring", damping: 18, stiffness: 280 }}
                  style={{ width: "100%", height: "100%" }}
                >
                  {slide.media === "custom" && (
                    <ScrollingAnimation scrollX={scrollX} index={index} />
                  )}
                  {slide.media === "icon" && slide.icon && (
                    <PulseIcon
                      Icon={slide.icon}
                      color={slide.color}
                      isActive={isActive}
                    />
                  )}
                </MotiView>
              </View>

              {/* Text Section */}
              <View style={styles.textSection}>
                <MotiView
                  from={{ opacity: 0, translateY: 40 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    translateY: isActive ? 0 : 40,
                  }}
                  transition={{ delay: 100, type: "spring", damping: 20 }}
                >
                  <Text style={styles.headline}>
                    {slide.headline}
                  </Text>
                </MotiView>
                <MotiView
                  from={{ opacity: 0, translateY: 30 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    translateY: isActive ? 0 : 30,
                  }}
                  transition={{ delay: 200, type: "spring", damping: 20 }}
                >
                  <Text style={styles.subtext}>
                    {slide.sub}
                  </Text>
                </MotiView>
              </View>

            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Dark gradient at the bottom to ensure text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(9,9,11,0.8)', 'rgba(9,9,11,1)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Fixed Footer UI */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          <Pressable onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>SKIP</Text>
          </Pressable>

          <Pressable onPress={handleNext} style={styles.nextBtnWrapper}>
            <MotiView
              animate={{ backgroundColor: activeColor }}
              transition={{ type: 'timing', duration: 400 }}
              style={styles.nextBtn}
            >
              <Text style={styles.nextText}>{isLast ? "Begin" : "Next"}</Text>
              {isLast ? (
                <ArrowRight size={22} color="#000" strokeWidth={3} />
              ) : (
                <ArrowRight size={22} color="#000" strokeWidth={3} />
              )}
            </MotiView>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#09090B" // Ultra dark modern
  },
  ambientGlow: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 300,
    height: 300,
    marginLeft: -150,
    borderRadius: 150,
    opacity: 0.08,
    filter: 'blur(100px)', // Web glow fallback
    zIndex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  mediaSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textSection: {
    height: 300, // Fixed height area to avoid jumping
    justifyContent: "flex-start",
    paddingTop: 20,
    paddingBottom: 100,
  },
  headline: {
    fontSize: 54, // Massive
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
    lineHeight: 56,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 17,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 26,
    paddingRight: 40,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 15,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
    zIndex: 20, // Above gradient
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
    paddingRight: 24, // Touch target
  },
  skipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  nextBtnWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  nextBtn: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 30,
    paddingHorizontal: 32,
  },
  nextText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
  },
  // Icon Media Styles
  iconMediaContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
  iconDisc: {
    width: 120,
    height: 120,
    borderRadius: 40, // Squircle
    alignItems: "center",
    justifyContent: "center",
  }
});
