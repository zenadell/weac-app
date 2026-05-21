import React, { useState } from "react";
import { View, Text, Pressable, Modal, Dimensions } from "react-native";
import { MotiView, MotiImage } from "moti";
import { X, Hexagon, Orbit, Award, Cpu, BookOpen, Fingerprint } from "lucide-react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <AppShell>
      <PageTransition>
        <Animated.ScrollView 
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 300, paddingTop: 64 }}
        >
          <View className="px-6 mb-8 items-center">
            <Text className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">
              The Vault
            </Text>
            <Text className="text-[3rem] font-black tracking-tight text-white leading-none text-center">
              Your Relics
            </Text>
            <Text className="mt-4 text-[13px] font-bold text-muted-foreground uppercase tracking-widest text-center">
              ↓ Scroll to rotate
            </Text>
          </View>

          {/* Radial Scroll Gallery Component */}
          <RadialScrollGallery 
            scrollY={scrollY} 
            radius={width * 0.9} 
            itemSize={160} 
            visiblePercentage={45}
          >
            {allCards.map((c, i) => (
              <Pressable 
                key={c.id} 
                onPress={() => { if (c.unlocked) { popBurst(0.5, 0.5); setOpen(c); } }}
                className="w-full h-full"
              >
                <View 
                  className="w-full h-full rounded-[24px] overflow-hidden p-4 border relative items-center justify-center"
                  style={{ 
                    backgroundColor: c.unlocked ? c.color + "1A" : "#1C1C24",
                    borderColor: c.unlocked ? c.color + "40" : "rgba(255,255,255,0.05)",
                    opacity: c.unlocked ? 1 : 0.6,
                    transform: [{ scale: c.unlocked ? 1 : 0.9 }]
                  }}
                >
                  {c.unlocked && (
                    <View className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  )}
                  
                  {c.unlocked ? (
                    <MotiView
                      from={{ translateY: 0 }}
                      animate={{ translateY: -5 }}
                      transition={{ loop: true, type: "timing", duration: 2000 + i * 200, direction: "alternate" }}
                      className="size-16 rounded-[16px] items-center justify-center border-2 border-white/20 mb-2"
                      style={{ backgroundColor: c.color, shadowColor: c.color, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15 }}
                    >
                      <c.icon size={28} color="#FFFFFF" strokeWidth={2} />
                    </MotiView>
                  ) : (
                    <View className="size-16 rounded-[16px] bg-[#2A2A35] border-2 border-white/5 items-center justify-center mb-2">
                      <Text className="text-2xl font-black text-white/20">?</Text>
                    </View>
                  )}

                  <View className="z-10 items-center">
                    <Text className="text-[11px] font-black leading-tight text-white text-center" numberOfLines={2}>{c.name}</Text>
                    <Text className="text-[9px] font-bold mt-1 text-white/50 uppercase tracking-widest">{c.subj}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </RadialScrollGallery>

          <View className="px-6 mt-12 items-center opacity-30">
             <Text className="text-xl font-black text-white uppercase tracking-widest">Keep scrolling</Text>
             <Text className="text-[10px] mt-2 font-bold text-white uppercase tracking-widest">More relics locked</Text>
          </View>
        </Animated.ScrollView>

        {/* Details Modal */}
        <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
          <Pressable onPress={() => setOpen(null)} className="flex-1 items-center justify-center bg-[#121214]/90 p-6 backdrop-blur-xl">
            <MotiView
              from={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{ width: "100%", maxWidth: 320 }}
            >
              {open && (
                <View 
                  className="rounded-[40px] p-8 border relative overflow-hidden items-center"
                  style={{ backgroundColor: open.color + "20", borderColor: open.color }}
                >
                  <View className="absolute inset-0 bg-black/40" />
                  
                  <Pressable onPress={() => setOpen(null)} className="absolute right-5 top-5 z-20 size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                    <X size={20} color="#FFFFFF" />
                  </Pressable>

                  <MotiView
                    from={{ rotate: "0deg", translateY: 0 }}
                    animate={{ rotate: "360deg", translateY: -10 }}
                    transition={{ loop: true, type: "timing", duration: 12000 }}
                    className="size-32 rounded-[40px] items-center justify-center border-4 border-white/20 z-10 shadow-2xl mt-8"
                    style={{ backgroundColor: open.color }}
                  >
                    <open.icon size={64} color="#FFFFFF" strokeWidth={1.5} />
                  </MotiView>

                  <View className="z-10 items-center mt-12 w-full">
                    <View className="rounded-full bg-white/10 px-3 py-1.5 border border-white/20 mb-4">
                      <Text className="text-[10px] font-black uppercase tracking-widest text-white">{open.rarity} Relic</Text>
                    </View>
                    <Text className="text-3xl font-black text-white text-center leading-none">{open.name}</Text>
                    <Text className="text-[13px] font-bold text-white/50 text-center mt-4 leading-relaxed px-4">
                      {open.lore}
                    </Text>
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
