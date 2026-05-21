// 1:1 port of src/routes/vault.tsx
import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { MotiView, MotiImage, AnimatePresence } from "moti";
import { X } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { popBurst } from "../lib/confetti";
import trophy from "../../assets/lovable/trophy.png";
import dna from "../../assets/lovable/dna-helix.png";
import atom from "../../assets/lovable/atom.png";
import brain from "../../assets/lovable/brain.png";
import calculator from "../../assets/lovable/calculator.png";
import books from "../../assets/lovable/books.png";

const allCards = [
  { name: "Molecular Architect", subj: "Biology", rarity: "Legendary", img: dna, gradient: "mint", unlocked: true, lore: "Awarded for 90%+ in Genetics. 1 in 240 students hold this card." },
  { name: "Golden Scholar", subj: "Weekly MVP", rarity: "Mythic", img: trophy, gradient: "butter", unlocked: true, dark: true, lore: "Reset every Sunday. Top 1% across all schools." },
  { name: "Atom Whisperer", subj: "Physics", rarity: "Rare", img: atom, gradient: "peach", unlocked: true, lore: "Mechanics chain of 10 perfect duels." },
  { name: "Mind Master", subj: "Psychology", rarity: "Epic", img: brain, gradient: "rose", unlocked: true, lore: "30-day streak holder." },
  { name: "Number Crusher", subj: "Maths", rarity: "Rare", img: calculator, gradient: "lilac", unlocked: false },
  { name: "Word Weaver", subj: "English", rarity: "Common", img: books, gradient: "sky", unlocked: false },
];

const tiers = ["All", "Legendary", "Mythic", "Epic", "Rare", "Common"];

export default function VaultScreen() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const cards = filter === "All" ? allCards : allCards.filter((c) => c.rarity === filter);

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <MotiView
            from={{ opacity: 0, translateY: -8 }} animate={{ opacity: 1, translateY: 0 }}
            className="px-6 pt-12 pb-6"
          >
            <Text className="text-sm font-medium text-muted-foreground">Mastery vault</Text>
            <Text className="mt-1 text-[2rem] font-semibold leading-none tracking-tight text-ink" style={{ fontSize: 32 }}>
              4 of 12 collected
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 16 }}>
              {tiers.map((t) => (
                <Pressable key={t} onPress={() => setFilter(t)}>
                  {filter === t ? (
                    <View className="rounded-full bg-ink px-4 py-1.5 border border-black/5">
                      <Text className="text-xs font-semibold text-white">{t}</Text>
                    </View>
                  ) : (
                    <View className="rounded-full bg-white px-4 py-1.5 border border-black/5">
                      <Text className="text-xs font-semibold text-ink">{t}</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </MotiView>

          <View className="flex-row flex-wrap px-6 pb-12" style={{ gap: 16 }}>
            {cards.map((c, i) => (
              <MotiView
                key={c.name}
                from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 70, duration: 500 }}
                style={{ width: "47%" }}
              >
                <Pressable
                  onPress={() => { if (c.unlocked) popBurst(0.5, 0.5); setOpen(c); }}
                >
                  <View style={{ aspectRatio: 3 / 4, opacity: c.unlocked ? 1 : 0.6 }}>
                    {c.unlocked ? (
                      <Gradient name={c.gradient} className="flex-1 rounded-[28px] p-4 border border-black/5" style={shadowSoft}>
                        <CardInner card={c} index={i} />
                      </Gradient>
                    ) : (
                      <View className="flex-1 rounded-[28px] bg-canvas p-4 border border-black/5" style={shadowSoft}>
                        <CardInner card={c} index={i} />
                      </View>
                    )}
                  </View>
                </Pressable>
              </MotiView>
            ))}
          </View>
        </ScrollView>

        {/* Modal */}
        <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
          <Pressable onPress={() => setOpen(null)} className="flex-1 items-center justify-center bg-ink/60 p-6">
            <MotiView
              from={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{ width: "100%", maxWidth: 320 }}
            >
              {open && (
                <View>
                  {open.unlocked ? (
                    <Gradient name={open.gradient} className="relative rounded-[36px] p-6" style={shadowPop}>
                      <ModalCardInner card={open} onClose={() => setOpen(null)} />
                    </Gradient>
                  ) : (
                    <View className="relative rounded-[36px] bg-canvas p-6" style={shadowPop}>
                      <ModalCardInner card={open} onClose={() => setOpen(null)} />
                    </View>
                  )}
                </View>
              )}
            </MotiView>
          </Pressable>
        </Modal>
      </PageTransition>
    </AppShell>
  );
}

function CardInner({ card, index }) {
  return (
    <View className="flex-1">
      <View className="flex-row items-start justify-between">
        <View className="rounded-full bg-white/30 px-2 py-0.5">
          <Text className={`text-[9px] font-bold uppercase tracking-wider ${card.dark ? "text-ink" : "text-white"}`}>
            {card.rarity}
          </Text>
        </View>
        <Text className={`text-[9px] ${card.dark ? "text-ink/60" : "text-white/60"}`} style={{ fontFamily: "monospace" }}>
          #{String(index + 1).padStart(4, "0")}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        {card.unlocked ? (
          <MotiImage
            source={card.img}
            from={{ translateY: 0, rotate: "-3deg" }}
            animate={{ translateY: -6, rotate: "3deg" }}
            transition={{ loop: true, type: "timing", duration: 4000 + index * 300 }}
            style={{ width: 96, height: 96 }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-5xl text-ink/20">?</Text>
        )}
      </View>
      <View>
        <Text className={`text-sm font-semibold leading-tight ${card.dark ? "text-ink" : "text-white"}`}>
          {card.name}
        </Text>
        <Text className={`text-[10px] mt-0.5 ${card.dark ? "text-ink/60" : "text-white/70"}`}>
          {card.subj}
        </Text>
      </View>
    </View>
  );
}

function ModalCardInner({ card, onClose }) {
  return (
    <>
      <Pressable
        onPress={onClose}
        className="absolute right-4 top-4 z-10 size-9 items-center justify-center rounded-full bg-white/30"
      >
        <X size={16} color={card.dark ? "#1B1A2E" : "#fff"} />
      </Pressable>
      <View className="items-center py-6">
        {card.unlocked ? (
          <MotiImage
            source={card.img}
            from={{ rotate: "0deg", translateY: 0 }}
            animate={{ rotate: "360deg", translateY: -8 }}
            transition={{ loop: true, type: "timing", duration: 10000 }}
            style={{ width: 144, height: 144 }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-7xl text-ink/30">?</Text>
        )}
      </View>
      <View className="self-start rounded-full bg-white/30 px-2 py-0.5">
        <Text className={`text-[10px] font-bold uppercase tracking-wider ${card.dark ? "text-ink" : "text-white"}`}>
          {card.rarity}
        </Text>
      </View>
      <Text className={`mt-2 text-xl font-semibold ${card.dark ? "text-ink" : "text-white"}`}>{card.name}</Text>
      <Text className={`mt-1 text-xs ${card.dark ? "text-ink/70" : "text-white/80"}`}>
        {card.unlocked
          ? card.lore || `Earned through mastery of ${card.subj}.`
          : `Locked. Hit 80% mastery in ${card.subj} to unlock.`}
      </Text>
    </>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
