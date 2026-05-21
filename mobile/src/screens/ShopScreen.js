// 1:1 port of src/routes/shop.tsx
import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Coins, Gem } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { useGame } from "../lib/game-store";
import { popBurst } from "../lib/confetti";

const bundles = [
  { id: "b1", name: "Starter Pack", desc: "500 coins + 5 gems",    emoji: "🎁", price: "₦500",   gradient: "peach" },
  { id: "b2", name: "Pro Pack",     desc: "2,500 coins + 30 gems", emoji: "💼", price: "₦1,500", gradient: "lilac" },
  { id: "b3", name: "Mega Vault",   desc: "8,000 coins + 100 gems",emoji: "🏛️", price: "₦4,000", gradient: "mint" },
];

export default function ShopScreen() {
  const navigation = useNavigation();
  const { coins, gems, powerups, buyPowerUp } = useGame();
  const [toast, setToast] = useState(null);
  const [denied, setDenied] = useState(null);

  function buy(id, name) {
    const ok = buyPowerUp(id);
    if (ok) {
      setToast(`Got ${name}`);
      popBurst(0.5, 0.3);
      setTimeout(() => setToast(null), 1600);
    } else {
      setDenied(id);
      setTimeout(() => setDenied(null), 600);
    }
  }

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <Pressable
              onPress={() => navigation.navigate("Home")}
              className="size-10 items-center justify-center rounded-2xl bg-white border border-black/5"
              style={shadowSoft}
            >
              <ArrowLeft size={16} color="#1B1A2E" />
            </Pressable>
            <Text className="text-sm font-semibold text-muted-foreground">Power shop</Text>
            <View className="flex-row gap-1.5">
              <View className="flex-row items-center gap-1 rounded-full bg-white px-2 py-1 border border-black/5" style={shadowSoft}>
                <Coins size={12} color="#FFD54F" />
                <Text className="text-[11px] font-bold text-ink">{coins.toLocaleString()}</Text>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-white px-2 py-1 border border-black/5" style={shadowSoft}>
                <Gem size={12} color="#9575CD" />
                <Text className="text-[11px] font-bold text-ink">{gems}</Text>
              </View>
            </View>
          </View>

          <View className="px-6 pb-4">
            <Text className="text-[1.9rem] font-semibold leading-tight text-ink" style={{ fontSize: 30 }}>Get the edge</Text>
            <Text className="text-sm text-muted-foreground">Power-ups stack across duels & exams</Text>
          </View>

          <View className="px-6 pt-2">
            <Text className="mb-3 px-1 text-sm font-semibold text-muted-foreground">Power-ups</Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {powerups.map((p, i) => (
                <MotiView
                  key={p.id}
                  from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 40 * i }}
                  style={{ width: "47%" }}
                >
                  <MotiView
                    animate={denied === p.id ? { translateX: 0 } : { translateX: 0 }}
                    transition={{ duration: 400 }}
                    className="rounded-3xl bg-white p-4 border border-black/5"
                    style={shadowSoft}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="size-12 items-center justify-center rounded-2xl bg-canvas">
                        <Text style={{ fontSize: 28 }}>{p.emoji}</Text>
                      </View>
                      {p.owned > 0 && (
                        <View className="rounded-full bg-mint/30 px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-teal">×{p.owned}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="mt-2 text-sm font-semibold text-ink">{p.name}</Text>
                    <Text className="text-[11px] text-muted-foreground">{p.desc}</Text>
                    <Pressable
                      onPress={() => buy(p.id, p.name)}
                      className="mt-3 w-full flex-row items-center justify-center gap-1 rounded-full bg-ink py-2"
                    >
                      {p.currency === "coins" ? (
                        <Coins size={12} color="#FFD54F" />
                      ) : (
                        <Gem size={12} color="#CE93D8" />
                      )}
                      <Text className="text-xs font-bold text-white">{p.price}</Text>
                    </Pressable>
                  </MotiView>
                </MotiView>
              ))}
            </View>
          </View>

          <View className="px-6 pt-8 pb-32">
            <Text className="mb-3 px-1 text-sm font-semibold text-muted-foreground">Bundles</Text>
            <View style={{ gap: 12 }}>
              {bundles.map((b, i) => (
                <MotiView
                  key={b.id}
                  from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 50 * i }}
                >
                  <Gradient name={b.gradient} className="flex-row items-center gap-4 rounded-3xl p-4 border border-black/5" style={shadowSoft}>
                    <View className="size-14 items-center justify-center rounded-2xl bg-white/25">
                      <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-white">{b.name}</Text>
                      <Text className="text-[11px] text-white/85">{b.desc}</Text>
                    </View>
                    <View className="rounded-full bg-white px-4 py-2">
                      <Text className="text-xs font-bold text-ink">{b.price}</Text>
                    </View>
                  </Gradient>
                </MotiView>
              ))}
            </View>
          </View>
        </ScrollView>

        <AnimatePresence>
          {toast && (
            <MotiView
              from={{ translateY: 60, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} exit={{ translateY: 60, opacity: 0 }}
              className="absolute bottom-28 self-center rounded-full bg-ink px-5 py-2.5"
              style={{ ...shadowPop, left: 0, right: 0, alignItems: "center" }}
            >
              <Text className="text-sm font-semibold text-white" style={{ textAlign: "center" }}>{toast}</Text>
            </MotiView>
          )}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
