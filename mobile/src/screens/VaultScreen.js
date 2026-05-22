import React, { useState, useCallback } from "react";
import { View, Text, Pressable, Dimensions, StyleSheet, Platform } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Hexagon, Orbit, Award, Cpu, BookOpen, Fingerprint, ChevronUp, ChevronDown, Zap, Shield, Clock, Star } from "lucide-react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useDerivedValue,
  withSpring,
  runOnJS,
  clamp,
} from "react-native-reanimated";
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
// Each item occupies 100px of scroll. Total scroll = 800 for full circle.
const STEP = 100;
const MAX_SCROLL = STEP * (ITEMS - 1); // Clamp so we don't spin forever

const RARITY_COLORS = {
  Common: "rgba(255,255,255,0.15)",
  Rare: "rgba(144,202,249,0.2)",
  Epic: "rgba(76,50,151,0.3)",
  Legendary: "rgba(48,197,160,0.25)",
  Mythic: "rgba(255,182,59,0.25)",
};

export default function VaultScreen() {
  const scrollY = useSharedValue(0);
  const savedY = useSharedValue(0);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Derive which card is at the top (focused)
  useDerivedValue(() => {
    // 800px = 360°, each card = 360/8 = 45°, so each card = 100px
    const idx = Math.round((-scrollY.value / STEP) % ITEMS);
    const normalized = ((idx % ITEMS) + ITEMS) % ITEMS;
    runOnJS(setFocusedIndex)(normalized);
  });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      scrollY.value = clamp(
        savedY.value + e.translationY,
        -MAX_SCROLL,
        MAX_SCROLL
      );
    })
    .onEnd((e) => {
      // Snap to nearest card position
      const raw = savedY.value + e.translationY;
      const clamped = Math.max(-MAX_SCROLL, Math.min(MAX_SCROLL, raw));
      const snapped = Math.round(clamped / STEP) * STEP;
      savedY.value = snapped;
      scrollY.value = withSpring(snapped, { damping: 20, stiffness: 200 });
    });

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const next = clamp(
      scrollY.value + e.deltaY * 0.5,
      -MAX_SCROLL,
      MAX_SCROLL
    );
    scrollY.value = next;
    savedY.value = next;

    // Snap after a brief pause (debounced on web)
    clearTimeout(handleWheel._t);
    handleWheel._t = setTimeout(() => {
      const snapped = Math.round(next / STEP) * STEP;
      savedY.value = snapped;
      scrollY.value = withSpring(snapped, { damping: 20, stiffness: 200 });
    }, 150);
  }, []);

  const handleNext = useCallback(() => {
    const next = clamp(savedY.value - STEP, -MAX_SCROLL, MAX_SCROLL);
    savedY.value = next;
    scrollY.value = withSpring(next, { damping: 20, stiffness: 200 });
  }, []);

  const handlePrev = useCallback(() => {
    const prev = clamp(savedY.value + STEP, -MAX_SCROLL, MAX_SCROLL);
    savedY.value = prev;
    scrollY.value = withSpring(prev, { damping: 20, stiffness: 200 });
  }, []);

  const focused = allCards[focusedIndex] || allCards[0];
  const unlockedCount = allCards.filter((c) => c.unlocked).length;

  return (
    <AppShell>
      <PageTransition>
        <View style={styles.container}>

          {/* ─── HEADER ─── */}
          <View style={styles.header}>
            <Text style={styles.label}>THE VAULT</Text>
            <Text style={styles.title}>Your Relics</Text>

            {/* Collection Progress Bar */}
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(unlockedCount / ITEMS) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{unlockedCount}/{ITEMS}</Text>
            </View>
          </View>

          {/* ─── FOCUSED RELIC INFO PANEL ─── */}
          <View style={styles.infoPanel}>
            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={focused.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{ type: "timing", duration: 250 }}
                style={styles.infoPanelInner}
              >
                {/* Rarity + Name */}
                <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[focused.rarity] || "rgba(255,255,255,0.1)" }]}>
                  <Text style={[styles.rarityText, { color: focused.color }]}>{focused.rarity}</Text>
                </View>
                <Text style={styles.focusedName}>{focused.name}</Text>
                <Text style={styles.focusedSubj}>{focused.subj}</Text>

                {/* Lore */}
                <Text style={styles.focusedLore}>{focused.lore}</Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  {focused.unlocked && focused.earnedDate && (
                    <View style={styles.statItem}>
                      <Clock size={14} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                      <Text style={styles.statText}>{focused.earnedDate}</Text>
                    </View>
                  )}
                  <View style={styles.statItem}>
                    <Star size={14} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                    <Text style={styles.statText}>{focused.holders?.toLocaleString()} holders</Text>
                  </View>
                </View>

                {/* Power Buff */}
                {focused.power && (
                  <View style={[styles.powerBadge, { borderColor: focused.color + "40" }]}>
                    <Zap size={14} color={focused.color} strokeWidth={2.5} />
                    <Text style={[styles.powerText, { color: focused.color }]}>{focused.power}</Text>
                  </View>
                )}

                {/* Lock Status */}
                {!focused.unlocked && (
                  <View style={styles.lockedBadge}>
                    <Shield size={14} color="rgba(255,255,255,0.3)" strokeWidth={2} />
                    <Text style={styles.lockedText}>Locked — Complete the challenge to earn</Text>
                  </View>
                )}
              </MotiView>
            </AnimatePresence>
          </View>

          {/* ─── NAV ARROWS ─── */}
          <View style={styles.arrowRow}>
            <Pressable onPress={handlePrev} style={styles.arrowBtn}>
              <ChevronUp size={20} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
            </Pressable>
            <Text style={styles.arrowHint}>Swipe or scroll</Text>
            <Pressable onPress={handleNext} style={styles.arrowBtn}>
              <ChevronDown size={20} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* ─── RADIAL WHEEL ─── */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={styles.galleryWrapper}
              {...(Platform.OS === "web" ? { onWheel: handleWheel } : {})}
            >
              <RadialScrollGallery
                scrollY={scrollY}
                radius={Math.min(width * 0.44, 200)}
                itemSize={130}
              >
                {allCards.map((c, i) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      // Snap the wheel to bring this card to focus
                      const target = -(i * STEP);
                      savedY.value = target;
                      scrollY.value = withSpring(target, { damping: 20, stiffness: 200 });
                    }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <View
                      style={{
                        width: "100%", height: "100%", borderRadius: 24,
                        overflow: "hidden", padding: 12, borderWidth: 1.5,
                        alignItems: "center", justifyContent: "center",
                        backgroundColor: c.unlocked ? c.color + "1A" : "#1C1C24",
                        borderColor: focusedIndex === i
                          ? c.color
                          : c.unlocked
                            ? c.color + "30"
                            : "rgba(255,255,255,0.04)",
                        opacity: c.unlocked ? 1 : 0.45,
                        shadowColor: c.unlocked ? c.color : "#000",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: c.unlocked ? 0.25 : 0.1,
                        shadowRadius: 14, elevation: 6,
                      }}
                    >
                      {c.unlocked ? (
                        <MotiView
                          from={{ translateY: 0 }}
                          animate={{ translateY: -3 }}
                          transition={{ loop: true, type: "timing", duration: 2000 + i * 200, direction: "alternate" }}
                          style={{
                            width: 44, height: 44, borderRadius: 14,
                            alignItems: "center", justifyContent: "center",
                            borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
                            backgroundColor: c.color, marginBottom: 8,
                          }}
                        >
                          <c.icon size={20} color="#FFFFFF" strokeWidth={2} />
                        </MotiView>
                      ) : (
                        <View style={{
                          width: 44, height: 44, borderRadius: 14,
                          backgroundColor: "#2A2A35", borderWidth: 2,
                          borderColor: "rgba(255,255,255,0.04)",
                          alignItems: "center", justifyContent: "center", marginBottom: 8,
                        }}>
                          <Text style={{ fontSize: 18, fontWeight: "900", color: "rgba(255,255,255,0.15)" }}>?</Text>
                        </View>
                      )}
                      <Text style={{ fontSize: 11, fontWeight: "900", color: "#FFF", textAlign: "center" }} numberOfLines={2}>{c.name}</Text>
                      <Text style={{ fontSize: 8, fontWeight: "700", marginTop: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.2 }}>{c.subj}</Text>
                    </View>
                  </Pressable>
                ))}
              </RadialScrollGallery>
            </Animated.View>
          </GestureDetector>
        </View>
      </PageTransition>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121214" },

  // Header
  header: { paddingHorizontal: 24, paddingTop: 52, alignItems: "center", zIndex: 10 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 3, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 40, fontWeight: "900", letterSpacing: -2, color: "#FFFFFF", lineHeight: 42, textAlign: "center" },

  // Progress
  progressRow: { flexDirection: "row", alignItems: "center", marginTop: 14, gap: 10 },
  progressTrack: { width: 120, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: "#FA675E" },
  progressText: { fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.5)", letterSpacing: 1 },

  // Info Panel
  infoPanel: { paddingHorizontal: 24, paddingTop: 16, zIndex: 10, minHeight: 180 },
  infoPanelInner: { alignItems: "center" },
  rarityBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  rarityText: { fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2 },
  focusedName: { fontSize: 24, fontWeight: "900", color: "#FFFFFF", textAlign: "center", lineHeight: 26, marginBottom: 2 },
  focusedSubj: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 },
  focusedLore: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 19, paddingHorizontal: 8, marginBottom: 12 },

  // Stats
  statsRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.4)" },

  // Power
  powerBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.03)" },
  powerText: { fontSize: 12, fontWeight: "800" },

  // Locked
  lockedBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  lockedText: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.3)" },

  // Arrows
  arrowRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 6, zIndex: 10 },
  arrowBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  arrowHint: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 2 },

  // Gallery
  galleryWrapper: { flex: 1, justifyContent: "center", alignItems: "center", overflow: "visible" },
});
