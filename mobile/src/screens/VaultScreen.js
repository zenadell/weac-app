import React, { useState, useCallback } from "react";
import { View, Text, Pressable, Modal, Dimensions, StyleSheet, Platform } from "react-native";
import { MotiView } from "moti";
import { X, Hexagon, Orbit, Award, Cpu, BookOpen, Fingerprint } from "lucide-react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
} from "react-native-reanimated";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { popBurst } from "../lib/confetti";
import { RadialScrollGallery } from "../components/ui/radial-scroll-gallery";

const { width } = Dimensions.get("window");

const allCards = [
  { id: "1", name: "Molecular Architect", subj: "Biology", rarity: "Legendary", icon: Fingerprint, color: "#30C5A0", unlocked: true, lore: "Awarded for 90%+ in Genetics. 1 in 240 students hold this card." },
  { id: "2", name: "Golden Scholar", subj: "Weekly MVP", rarity: "Mythic", icon: Award, color: "#FFB63B", unlocked: true, lore: "Reset every Sunday. Top 1% across all schools." },
  { id: "3", name: "Atom Whisperer", subj: "Physics", rarity: "Rare", icon: Orbit, color: "#FA675E", unlocked: true, lore: "Mechanics chain of 10 perfect duels." },
  { id: "4", name: "Mind Master", subj: "Psychology", rarity: "Epic", icon: Hexagon, color: "#4C3297", unlocked: true, lore: "30-day streak holder." },
  { id: "5", name: "Number Crusher", subj: "Maths", rarity: "Rare", icon: Cpu, color: "#90CAF9", unlocked: false },
  { id: "6", name: "Word Weaver", subj: "English", rarity: "Common", icon: BookOpen, color: "#CE93D8", unlocked: false },
  { id: "7", name: "History Buff", subj: "History", rarity: "Common", icon: BookOpen, color: "#CE93D8", unlocked: false },
  { id: "8", name: "Geography Genius", subj: "Geography", rarity: "Epic", icon: Orbit, color: "#4C3297", unlocked: false },
];

export default function VaultScreen() {
  const [open, setOpen] = useState(null);
  const scrollY = useSharedValue(0);
  const savedY = useSharedValue(0);

  // Pan gesture: drag up/down to rotate the wheel
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      scrollY.value = savedY.value + e.translationY;
    })
    .onEnd((e) => {
      // Save position and add momentum decay
      savedY.value = savedY.value + e.translationY;
      scrollY.value = withDecay({
        velocity: e.velocityY,
        deceleration: 0.997,
      });
    });

  // Also handle mouse wheel for web testing
  const handleWheel = useCallback((e) => {
    // Prevent page scroll
    e.preventDefault();
    scrollY.value = scrollY.value + e.deltaY * 0.5;
    savedY.value = scrollY.value;
  }, []);

  return (
    <AppShell>
      <PageTransition>
        <View style={styles.container}>
          {/* Fixed header */}
          <View style={styles.header}>
            <Text style={styles.label}>THE VAULT</Text>
            <Text style={styles.title}>Your Relics</Text>
            <Text style={styles.hint}>↓ Swipe to rotate</Text>
          </View>

          {/* Gallery area with gesture capture */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={styles.galleryWrapper}
              // Web mouse wheel support
              {...(Platform.OS === "web" ? { onWheel: handleWheel } : {})}
            >
              <RadialScrollGallery
                scrollY={scrollY}
                radius={Math.min(width * 0.44, 200)}
                itemSize={140}
              >
                {allCards.map((c, i) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      if (c.unlocked) {
                        try { popBurst(0.5, 0.5); } catch {}
                        setOpen(c);
                      }
                    }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <View
                      style={{
                        width: "100%", height: "100%", borderRadius: 28,
                        overflow: "hidden", padding: 16, borderWidth: 1,
                        alignItems: "center", justifyContent: "center",
                        backgroundColor: c.unlocked ? c.color + "1A" : "#1C1C24",
                        borderColor: c.unlocked ? c.color + "40" : "rgba(255,255,255,0.05)",
                        opacity: c.unlocked ? 1 : 0.5,
                        shadowColor: c.unlocked ? c.color : "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: c.unlocked ? 0.3 : 0.1,
                        shadowRadius: 16, elevation: 8,
                      }}
                    >
                      {c.unlocked ? (
                        <MotiView
                          from={{ translateY: 0 }}
                          animate={{ translateY: -4 }}
                          transition={{ loop: true, type: "timing", duration: 2000 + i * 200, direction: "alternate" }}
                          style={{
                            width: 52, height: 52, borderRadius: 16,
                            alignItems: "center", justifyContent: "center",
                            borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
                            backgroundColor: c.color, marginBottom: 10,
                            shadowColor: c.color, shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.5, shadowRadius: 12,
                          }}
                        >
                          <c.icon size={24} color="#FFFFFF" strokeWidth={2} />
                        </MotiView>
                      ) : (
                        <View
                          style={{
                            width: 52, height: 52, borderRadius: 16,
                            backgroundColor: "#2A2A35", borderWidth: 2,
                            borderColor: "rgba(255,255,255,0.05)",
                            alignItems: "center", justifyContent: "center", marginBottom: 10,
                          }}
                        >
                          <Text style={{ fontSize: 22, fontWeight: "900", color: "rgba(255,255,255,0.2)" }}>?</Text>
                        </View>
                      )}

                      <Text style={{ fontSize: 12, fontWeight: "900", color: "#FFF", textAlign: "center" }} numberOfLines={2}>
                        {c.name}
                      </Text>
                      <Text style={{ fontSize: 9, fontWeight: "700", marginTop: 4, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                        {c.subj}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </RadialScrollGallery>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Details Modal */}
        <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
          <Pressable onPress={() => setOpen(null)} style={styles.modalOverlay}>
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{ width: "100%", maxWidth: 320 }}
            >
              {open && (
                <View style={[styles.modalCard, { backgroundColor: open.color + "20", borderColor: open.color }]}>
                  <View style={styles.modalDarkOverlay} />
                  <Pressable onPress={() => setOpen(null)} style={styles.modalClose}>
                    <X size={20} color="#FFFFFF" />
                  </Pressable>
                  <MotiView
                    from={{ rotate: "0deg" }}
                    animate={{ rotate: "360deg" }}
                    transition={{ loop: true, type: "timing", duration: 12000 }}
                    style={[styles.modalIcon, { backgroundColor: open.color, shadowColor: open.color }]}
                  >
                    <open.icon size={56} color="#FFFFFF" strokeWidth={1.5} />
                  </MotiView>
                  <View style={styles.modalInfo}>
                    <View style={styles.rarityBadge}>
                      <Text style={styles.rarityText}>{open.rarity} Relic</Text>
                    </View>
                    <Text style={styles.modalName}>{open.name}</Text>
                    <Text style={styles.modalLore}>{open.lore}</Text>
                  </View>
                </View>
              )}
            </MotiView>
          </Pressable>
        </Modal>
      </PageTransition>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121214" },
  header: {
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16,
    alignItems: "center", zIndex: 10,
  },
  label: {
    fontSize: 10, fontWeight: "800", letterSpacing: 3,
    color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8,
  },
  title: {
    fontSize: 46, fontWeight: "900", letterSpacing: -2,
    color: "#FFFFFF", lineHeight: 48, textAlign: "center",
  },
  hint: {
    marginTop: 14, fontSize: 13, fontWeight: "700",
    color: "#FA675E", textTransform: "uppercase", letterSpacing: 2, textAlign: "center",
  },
  galleryWrapper: {
    flex: 1, justifyContent: "center", alignItems: "center",
    overflow: "visible",
  },
  modalOverlay: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(18,18,20,0.92)", padding: 24,
  },
  modalCard: {
    borderRadius: 40, padding: 32, borderWidth: 1,
    overflow: "hidden", alignItems: "center",
  },
  modalDarkOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalClose: {
    position: "absolute", right: 20, top: 20, zIndex: 20,
    width: 40, height: 40, alignItems: "center", justifyContent: "center",
    borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)",
  },
  modalIcon: {
    width: 120, height: 120, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    borderWidth: 4, borderColor: "rgba(255,255,255,0.2)",
    zIndex: 10, marginTop: 32,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 24, elevation: 15,
  },
  modalInfo: { zIndex: 10, alignItems: "center", marginTop: 40, width: "100%" },
  rarityBadge: {
    borderRadius: 999, backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", marginBottom: 16,
  },
  rarityText: { fontSize: 10, fontWeight: "900", color: "#FFF", textTransform: "uppercase", letterSpacing: 2 },
  modalName: { fontSize: 28, fontWeight: "900", color: "#FFF", textAlign: "center", lineHeight: 30 },
  modalLore: {
    fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.5)",
    textAlign: "center", marginTop: 16, lineHeight: 20, paddingHorizontal: 16,
  },
});
