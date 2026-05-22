import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Coins, Gem } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { useGame } from "../lib/game-store";
import { popBurst } from "../lib/confetti";
import { LinearGradient } from "expo-linear-gradient";

const bundles = [
  { id: "b1", name: "Starter Pack", desc: "500 coins + 5 gems",    emoji: "🎁", price: "₦500",   colors: ['#FA675E', '#E5463D'] },
  { id: "b2", name: "Pro Pack",     desc: "2,500 coins + 30 gems", emoji: "💼", price: "₦1,500", colors: ['#9F7AEA', '#4C3297'] },
  { id: "b3", name: "Mega Vault",   desc: "8,000 coins + 100 gems",emoji: "🏛️", price: "₦4,000", colors: ['#30C5A0', '#1C8A6E'] },
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
            <Pressable
              onPress={() => navigation.navigate("Home")}
              className="size-12 items-center justify-center rounded-full bg-[#1C1C24] border border-white/5"
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
            <View className="flex-row gap-2">
              <View className="flex-row items-center gap-1.5 rounded-full bg-[#1C1C24] px-4 py-2 border border-white/5">
                <Coins size={14} color="#FFB63B" fill="#FFB63B" />
                <Text className="text-[13px] font-black text-white">{coins.toLocaleString()}</Text>
              </View>
              <View className="flex-row items-center gap-1.5 rounded-full bg-[#1C1C24] px-4 py-2 border border-white/5">
                <Gem size={14} color="#9F7AEA" fill="#9F7AEA" />
                <Text className="text-[13px] font-black text-white">{gems}</Text>
              </View>
            </View>
          </View>

          <View className="px-6 pb-6">
            <Text className="text-[2.5rem] font-black tracking-tighter text-white mb-2 leading-none">Armory</Text>
            <Text className="text-base text-muted-foreground font-medium">Equip power-ups for your next duel.</Text>
          </View>

          <View className="px-6 pt-2">
            <Text className="mb-4 text-sm font-black text-muted-foreground uppercase tracking-widest">Power-ups</Text>
            <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
              {powerups.map((p, i) => (
                <MotiView
                  key={p.id}
                  from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 40 * i }}
                  style={{ width: "48%" }}
                >
                  <MotiView
                    animate={denied === p.id ? { translateX: [-5, 5, -5, 5, 0] } : { translateX: 0 }}
                    transition={{ duration: 400 }}
                    className="rounded-[32px] bg-[#1C1C24] p-5 border border-white/5"
                  >
                    <View className="flex-row items-start justify-between mb-4">
                      <View className="size-14 items-center justify-center rounded-2xl bg-[#2A2A35]">
                        <Text style={{ fontSize: 28 }}>{p.emoji}</Text>
                      </View>
                      {p.owned > 0 && (
                        <View className="rounded-full bg-primary/20 px-3 py-1">
                          <Text className="text-[11px] font-black text-primary">×{p.owned}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="mt-2 text-[15px] font-black text-white">{p.name}</Text>
                    <Text className="text-[11px] font-medium text-muted-foreground mt-1 mb-4 h-8">{p.desc}</Text>
                    <Pressable
                      onPress={() => buy(p.id, p.name)}
                      className="w-full flex-row items-center justify-center gap-1.5 rounded-full bg-white py-3"
                    >
                      {p.currency === "coins" ? (
                        <Coins size={14} color="#FFB63B" fill="#FFB63B" />
                      ) : (
                        <Gem size={14} color="#9F7AEA" fill="#9F7AEA" />
                      )}
                      <Text className="text-[13px] font-black text-[#121214]">{p.price}</Text>
                    </Pressable>
                  </MotiView>
                </MotiView>
              ))}
            </View>
          </View>

          <View className="px-6 pt-10 pb-8">
            <Text className="mb-4 text-sm font-black text-muted-foreground uppercase tracking-widest">Vault Bundles</Text>
            <View style={{ gap: 16 }}>
              {bundles.map((b, i) => (
                <MotiView
                  key={b.id}
                  from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 50 * i }}
                >
                  <LinearGradient 
                    colors={b.colors} 
                    className="flex-row items-center gap-4 rounded-[32px] p-5 border border-white/10"
                  >
                    <View className="size-16 items-center justify-center rounded-[24px] bg-white/20">
                      <Text style={{ fontSize: 32 }}>{b.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-black text-white">{b.name}</Text>
                      <Text className="text-[13px] font-bold text-white/80">{b.desc}</Text>
                    </View>
                    <View className="rounded-full bg-white px-5 py-3 shadow-xl">
                      <Text className="text-[13px] font-black text-[#121214]">{b.price}</Text>
                    </View>
                  </LinearGradient>
                </MotiView>
              ))}
            </View>
          </View>
        </ScrollView>

        <AnimatePresence>
          {toast && (
            <MotiView
              from={{ translateY: 60, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} exit={{ translateY: 60, opacity: 0 }}
              className="absolute bottom-10 self-center rounded-full bg-primary px-8 py-4 shadow-xl"
            >
              <Text className="text-[15px] font-black text-[#121214] text-center uppercase tracking-widest">{toast}</Text>
            </MotiView>
          )}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  );
}
