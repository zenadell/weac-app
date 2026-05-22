import React, { useState, useCallback } from "react";
import { View, Text, Pressable, Dimensions, StyleSheet, Platform } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Hexagon, Orbit, Award, Cpu, BookOpen, Fingerprint, ChevronLeft, ChevronRight, Zap, Shield, Clock, Star } from "lucide-react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useDerivedValue,
  withSpring,
  runOnJS,
  clamp,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { RadialScrollGallery } from "../components/ui/radial-scroll-gallery";

const { width } = Dimensions.get("window");

const allCards = [
  { id: "1", name: "Molecular Architect", subj: "Biology", rarity: "Legendary", icon: Fingerprint, color: "#30C5A0", unlocked: true, lore: "Awarded for 90%+ in Genetics. 1 in 240 students hold this card.", power: "+15% XP in Biology duels", earnedDate: "May 12, 2026", holders: 240 },
  { id: "2", name: "Golden Scholar", subj: "Weekly MVP", rarity: "Mythic", icon: Award, color: "#FFB63B", unlocked: true, lore: "Reset every Sunday. Top 1% across all schools.", power: "+25% Coins from all activities", earnedDate: "May 18, 2026", holders: 48 },
  { id: "3", name: "Atom Whisperer", subj: "Physics", rarity: "Rare", icon: Orbit, color: "#FA675E", unlocked: true, lore: "Mechanics chain of 10 perfect duels.", power: "+10% XP in Physics duels", earnedDate: "Apr 28, 2026", holders: 1200 },
  { id: "4", name: "Mind Master", subj: "Psychology", rarity: "Epic", icon: Hexagon, color: "#4C3297", unlocked: true, lore: "30-day streak holder.", power: "Extra 5s in timed quizzes", earnedDate: "May 1, 2026", holders: 380 },
  { id: "5", name: "Number Crusher", subj: "Maths", rarity: "Rare", icon: Cpu, color: "#90CAF9", unlocked: false, lore: "Complete 50 Maths quizzes with 80%+ accuracy.", power: "+10% XP in Maths duels", holders: 890 },
  { id: "6", name: "Word Weaver", subj: "English", rarity: "Common", icon: BookOpen, color: "#CE93D8", unlocked: false, lore: "Answer 100 English questions correctly.", power: "+5% XP in English duels", holders: 3200 },
  { id: "7", name: "History Buff", subj: "History", rarity: "Common", icon: BookOpen, color: "#CE93D8", unlocked: false, lore: "Complete the History syllabus in Study mode.", power: "+5% XP in History duels", holders: 2100 },
  { id: "8", name: "Geography Genius", subj: "Geography", rarity: "Epic", icon: Orbit, color: "#4C3297", unlocked: false, lore: "Win 20 Geography duels in a row.", power: "Double coins in Geography", holders: 310 },
];

const ITEMS = allCards.length;
const STEP = 100;
const MAX_SCROLL = STEP * (ITEMS - 1);

export default function VaultScreen() {
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);
  const savedY = useSharedValue(0);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useDerivedValue(() => {
    const idx = Math.round((-scrollY.value / STEP) % ITEMS);
    const normalized = ((idx % ITEMS) + ITEMS) % ITEMS;
    runOnJS(setFocusedIndex)(normalized);
  });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      scrollY.value = clamp(savedY.value + e.translationY, -MAX_SCROLL, MAX_SCROLL);
    })
    .onEnd((e) => {
      const raw = savedY.value + e.translationY;
      const clamped = Math.max(-MAX_SCROLL, Math.min(MAX_SCROLL, raw));
      const snapped = Math.round(clamped / STEP) * STEP;
      savedY.value = snapped;
      scrollY.value = withSpring(snapped, { damping: 22, stiffness: 220, mass: 0.8 });
    });

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const next = clamp(scrollY.value + e.deltaY * 0.5, -MAX_SCROLL, MAX_SCROLL);
    scrollY.value = next;
    savedY.value = next;

    clearTimeout(handleWheel._t);
    handleWheel._t = setTimeout(() => {
      const snapped = Math.round(next / STEP) * STEP;
      savedY.value = snapped;
      scrollY.value = withSpring(snapped, { damping: 22, stiffness: 220, mass: 0.8 });
    }, 150);
  }, []);

  const handleNext = useCallback(() => {
    const next = clamp(savedY.value - STEP, -MAX_SCROLL, MAX_SCROLL);
    savedY.value = next;
    scrollY.value = withSpring(next, { damping: 22, stiffness: 220, mass: 0.8 });
  }, []);

  const handlePrev = useCallback(() => {
    const prev = clamp(savedY.value + STEP, -MAX_SCROLL, MAX_SCROLL);
    savedY.value = prev;
    scrollY.value = withSpring(prev, { damping: 22, stiffness: 220, mass: 0.8 });
  }, []);

  const focused = allCards[focusedIndex] || allCards[0];
  const unlockedCount = allCards.filter((c) => c.unlocked).length;

  return (
    <AppShell>
      <PageTransition>
        <View style={styles.container}>
          
          {/* Subtle Ambient Background Glow based on focused card */}
          <MotiView 
            animate={{ backgroundColor: focused.color }}
            transition={{ type: 'timing', duration: 800 }}
            style={styles.ambientGlow} 
          />

          {/* ─── HEADER ─── */}
          <View style={styles.header}>
            <Text style={styles.label}>THE VAULT</Text>
            <Text style={styles.title}>Your Relics</Text>
            
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>{unlockedCount}/{ITEMS}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(unlockedCount / ITEMS) * 100}%` }]} />
              </View>
            </View>
          </View>

          {/* ─── FOCUSED RELIC INFO PANEL ─── */}
          <View style={styles.infoPanel}>
            
            {/* Nav Arrows positioned on sides of the panel */}
            <Pressable onPress={handlePrev} style={[styles.arrowBtn, { left: 16 }]}>
              <ChevronLeft size={24} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
            </Pressable>
            
            <Pressable onPress={handleNext} style={[styles.arrowBtn, { right: 16 }]}>
              <ChevronRight size={24} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
            </Pressable>

            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={focused.id}
                from={{ opacity: 0, scale: 0.96, translateY: 10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 1.04, translateY: -10 }}
                transition={{ type: "timing", duration: 300, easing: (t) => t * (2 - t) }}
                style={styles.infoGlassCard}
              >
                {/* Rarity */}
                <View style={[styles.rarityBadge, { backgroundColor: focused.color + "20", borderColor: focused.color + "40" }]}>
                  <Text style={[styles.rarityText, { color: focused.color }]}>{focused.rarity}</Text>
                </View>
                
                <Text style={styles.focusedName}>{focused.name}</Text>
                <Text style={styles.focusedSubj}>{focused.subj}</Text>

                <View style={styles.divider} />

                {/* Lore */}
                <Text style={styles.focusedLore}>{focused.lore}</Text>

                {/* Stats */}
                <View style={styles.statsRow}>
                  {focused.unlocked && focused.earnedDate && (
                    <View style={styles.statItem}>
                      <Clock size={12} color="rgba(255,255,255,0.4)" strokeWidth={2.5} />
                      <Text style={styles.statText}>{focused.earnedDate}</Text>
                    </View>
                  )}
                  <View style={styles.statItem}>
                    <Star size={12} color="rgba(255,255,255,0.4)" strokeWidth={2.5} />
                    <Text style={styles.statText}>{focused.holders?.toLocaleString()} holders</Text>
                  </View>
                </View>

                {/* Power Buff / Lock Status */}
                <View style={styles.footerBadgeContainer}>
                  {focused.unlocked ? (
                    <View style={[styles.powerBadge, { backgroundColor: focused.color }]}>
                      <Zap size={14} color="#000" strokeWidth={3} />
                      <Text style={styles.powerText}>{focused.power}</Text>
                    </View>
                  ) : (
                    <Pressable 
                      style={styles.lockedBadge}
                      onPress={() => navigation.navigate("Subject", { id: "1" })}
                    >
                      <Shield size={14} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
                      <Text style={styles.lockedText}>Locked — Complete challenge to earn</Text>
                    </Pressable>
                  )}
                </View>

              </MotiView>
            </AnimatePresence>
          </View>

          {/* ─── RADIAL WHEEL ─── */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={styles.galleryWrapper}
              {...(Platform.OS === "web" ? { onWheel: handleWheel } : {})}
            >
              {/* Swipe Hint */}
              <View style={styles.swipeHintContainer}>
                <Text style={styles.swipeHint}>Swipe to explore</Text>
              </View>

              <RadialScrollGallery
                scrollY={scrollY}
                radius={Math.min(width * 0.44, 210)}
                itemSize={136}
              >
                {allCards.map((c, i) => {
                  const isFocused = focusedIndex === i;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        const target = -(i * STEP);
                        savedY.value = target;
                        scrollY.value = withSpring(target, { damping: 22, stiffness: 220, mass: 0.8 });
                      }}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <View
                        style={[
                          styles.wheelCard,
                          {
                            backgroundColor: c.unlocked ? c.color + (isFocused ? "26" : "12") : "rgba(25,25,30,0.8)",
                            borderColor: isFocused ? c.color : (c.unlocked ? c.color + "30" : "rgba(255,255,255,0.06)"),
                            opacity: c.unlocked ? 1 : 0.5,
                            shadowColor: isFocused ? c.color : "#000",
                            shadowOpacity: isFocused ? 0.4 : 0.1,
                          }
                        ]}
                      >
                        {c.unlocked ? (
                          <MotiView
                            animate={{ 
                              scale: isFocused ? 1.1 : 1,
                              translateY: isFocused ? -4 : 0
                            }}
                            transition={{ type: "spring", damping: 15 }}
                            style={[
                              styles.wheelIconContainer,
                              { backgroundColor: c.color, shadowColor: c.color }
                            ]}
                          >
                            <c.icon size={22} color="#000" strokeWidth={2.5} />
                          </MotiView>
                        ) : (
                          <View style={styles.lockedIconContainer}>
                            <Text style={styles.lockedQuestion}>?</Text>
                          </View>
                        )}
                        <Text style={[styles.wheelCardName, { color: isFocused ? "#FFF" : "rgba(255,255,255,0.7)" }]} numberOfLines={2}>
                          {c.name}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </RadialScrollGallery>
            </Animated.View>
          </GestureDetector>
          
        </View>
      </PageTransition>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" }, // Deeper, modern dark
  
  ambientGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 300,
    height: 300,
    marginLeft: -150,
    borderRadius: 150,
    opacity: 0.08,
    filter: 'blur(80px)', // Works on web, native ignores or needs specific blur view
  },

  // Header
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 60, 
    paddingBottom: 20, 
    zIndex: 10,
    alignItems: 'center'
  },
  label: { 
    fontSize: 11, 
    fontWeight: "800", 
    letterSpacing: 4, 
    color: "rgba(255,255,255,0.4)", 
    textTransform: "uppercase",
    marginBottom: 8
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 8,
    marginTop: 12
  },
  progressText: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: "rgba(255,255,255,0.8)", 
    letterSpacing: 1 
  },
  progressTrack: { 
    width: 40, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    overflow: "hidden" 
  },
  progressFill: { 
    height: "100%", 
    borderRadius: 2, 
    backgroundColor: "#FFF" 
  },
  title: { 
    fontSize: 42, 
    fontWeight: "900", 
    letterSpacing: -1.5, 
    color: "#FFFFFF", 
  },

  // Info Panel
  infoPanel: { 
    paddingHorizontal: 24, 
    paddingTop: 10,
    paddingBottom: 20,
    zIndex: 20, 
    minHeight: 260,
    justifyContent: 'center'
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -20, // half height
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  infoGlassCard: {
    alignItems: "center",
    backgroundColor: 'rgba(20, 20, 25, 0.6)', // Glassy dark
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 28,
    marginHorizontal: 36, // leave room for arrows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
    // Note: To get real glass on Native, we'd use BlurView, but a semi-transparent dark bg is safe and performant cross-platform.
  },
  rarityBadge: { 
    borderRadius: 999, 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    marginBottom: 12,
    borderWidth: 1,
  },
  rarityText: { 
    fontSize: 10, 
    fontWeight: "900", 
    textTransform: "uppercase", 
    letterSpacing: 2 
  },
  focusedName: { 
    fontSize: 26, 
    fontWeight: "900", 
    color: "#FFFFFF", 
    textAlign: "center", 
    lineHeight: 28, 
    marginBottom: 4 
  },
  focusedSubj: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: "rgba(255,255,255,0.5)", 
    textTransform: "uppercase", 
    letterSpacing: 3 
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
    borderRadius: 1
  },
  focusedLore: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "rgba(255,255,255,0.7)", 
    textAlign: "center", 
    lineHeight: 22, 
    marginBottom: 16 
  },
  statsRow: { 
    flexDirection: "row", 
    gap: 16, 
    marginBottom: 20 
  },
  statItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6 
  },
  statText: { 
    fontSize: 11, 
    fontWeight: "700", 
    color: "rgba(255,255,255,0.5)" 
  },
  footerBadgeContainer: {
    width: '100%',
    alignItems: 'center'
  },
  powerBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  powerText: { 
    fontSize: 12, 
    fontWeight: "900", 
    color: "#000",
    letterSpacing: 0.5
  },
  lockedBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  lockedText: { 
    fontSize: 11, 
    fontWeight: "700", 
    color: "rgba(255,255,255,0.5)" 
  },

  // Gallery
  galleryWrapper: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    overflow: "visible",
    zIndex: 5
  },
  swipeHintContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    width: '100%',
    zIndex: 1
  },
  swipeHint: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.2)',
    textTransform: 'uppercase',
    letterSpacing: 3
  },
  wheelCard: {
    width: "100%", 
    height: "100%", 
    borderRadius: 32, // More rounded "squircle"
    overflow: "hidden", 
    padding: 12, 
    borderWidth: 1.5,
    alignItems: "center", 
    justifyContent: "center",
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20, 
    elevation: 8,
  },
  wheelIconContainer: {
    width: 48, 
    height: 48, 
    borderRadius: 16,
    alignItems: "center", 
    justifyContent: "center",
    marginBottom: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, 
    shadowRadius: 12,
  },
  lockedIconContainer: {
    width: 48, 
    height: 48, 
    borderRadius: 16,
    backgroundColor: "#1C1C24", 
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 10,
  },
  lockedQuestion: { 
    fontSize: 20, 
    fontWeight: "900", 
    color: "rgba(255,255,255,0.2)" 
  },
  wheelCardName: { 
    fontSize: 12, 
    fontWeight: "900", 
    textAlign: "center",
    lineHeight: 14
  }
});
