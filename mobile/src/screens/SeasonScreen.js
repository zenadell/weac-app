// 1:1 port of src/routes/season.tsx
import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Check, Crown, Lock } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { useGame } from "../lib/game-store";
import { popBurst } from "../lib/confetti";

const tiers = Array.from({ length: 30 }, (_, i) => {
  const t = i + 1;
  const rewardsFree = ["50 XP", "100 coins", "1 gem", "Hint ×2", "Spin", "200 coins", "Skip ×1", "3 gems", "500 coins", "Frame"];
  const rewardsPro = ["200 XP", "Card pack", "5 gems", "2× XP", "Card pack", "10 gems", "Mythic frame", "1000 coins", "Avatar", "Title"];
  return { tier: t, free: rewardsFree[i % rewardsFree.length], pro: rewardsPro[i % rewardsPro.length] };
});

export default function SeasonScreen() {
  const navigation = useNavigation();
  const { seasonTier, seasonXp } = useGame();
  const [claimed, setClaimed] = useState(new Set());
  const [isPro, setIsPro] = useState(false);

  function claim(t) {
    if (t > seasonTier) return;
    setClaimed((s) => new Set(s).add(t));
    popBurst(0.5, 0.4);
  }

  const pct = (seasonXp / 500) * 100;

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
            <Text className="text-sm font-semibold text-muted-foreground">Season 03 · Galaxy</Text>
            <View className="size-10" />
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}
            className="mx-6"
          >
            <Gradient name="lilac" className="relative rounded-[32px] p-6" style={shadowPop}>
              <Text className="text-[11px] font-bold uppercase tracking-widest text-white/90">Current tier</Text>
              <Text className="text-5xl font-bold tabular-nums text-white">{seasonTier}</Text>
              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-[11px] font-semibold text-white">Tier {seasonTier}</Text>
                <Text className="text-[11px] font-semibold tabular-nums text-white/90">{seasonXp}/500 XP</Text>
                <Text className="text-[11px] font-semibold text-white">Tier {seasonTier + 1}</Text>
              </View>
              <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/25">
                <MotiView
                  from={{ width: "0%" }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1000 }}
                  className="h-full rounded-full bg-white"
                />
              </View>
              <Text className="mt-3 text-xs text-white/90">Season ends in 14 days · Don't miss the Mythic card</Text>
            </Gradient>
          </MotiView>

          <View className="flex-row items-center justify-between gap-2 px-6 pt-6">
            <View className="flex-row rounded-full bg-white p-1 border border-black/5" style={shadowSoft}>
              <Pressable onPress={() => setIsPro(false)} className={`relative rounded-full px-4 py-1.5 ${!isPro ? "bg-ink" : ""}`}>
                <Text className={`text-xs font-bold ${!isPro ? "text-white" : "text-ink"}`}>Free</Text>
              </Pressable>
              <Pressable onPress={() => setIsPro(true)} className="relative rounded-full px-4 py-1.5 overflow-hidden">
                {isPro && (
                  <View className="absolute inset-0">
                    <Gradient name="peach" className="absolute inset-0 rounded-full" />
                  </View>
                )}
                <View className="flex-row items-center gap-1">
                  <Crown size={12} color={isPro ? "#fff" : "#1B1A2E"} />
                  <Text className={`text-xs font-bold ${isPro ? "text-white" : "text-ink"}`}>Pro</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View className="px-6 pt-4 pb-32" style={{ gap: 8 }}>
            {tiers.map((row, i) => {
              const reward = isPro ? row.pro : row.free;
              const locked = row.tier > seasonTier;
              const claimedNow = claimed.has(row.tier);
              return (
                <MotiView
                  key={row.tier}
                  from={{ opacity: 0, translateX: -8 }} animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: Math.min(i * 25, 500) }}
                  className={`flex-row items-center gap-3 rounded-2xl p-3 border border-black/5 ${
                    locked ? "bg-canvas" : "bg-white"
                  }`}
                  style={locked ? { opacity: 0.7 } : shadowSoft}
                >
                  {locked ? (
                    <View className="size-10 items-center justify-center rounded-xl bg-canvas">
                      <Text className="text-xs font-bold text-muted-foreground">{row.tier}</Text>
                    </View>
                  ) : (
                    <Gradient name="peach" className="size-10 items-center justify-center rounded-xl">
                      <Text className="text-xs font-bold text-white">{row.tier}</Text>
                    </Gradient>
                  )}
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink" numberOfLines={1}>{reward}</Text>
                    <Text className="text-[11px] text-muted-foreground">{isPro ? "Pro reward" : "Free reward"}</Text>
                  </View>
                  <Pressable
                    onPress={() => claim(row.tier)}
                    disabled={locked || claimedNow}
                    className={`h-9 items-center justify-center rounded-full px-3 ${
                      claimedNow ? "bg-mint/30" : locked ? "bg-canvas" : "bg-ink"
                    }`}
                  >
                    {locked ? (
                      <Lock size={12} color="#7B7995" />
                    ) : claimedNow ? (
                      <Check size={12} color="#4DB6AC" />
                    ) : (
                      <Text className="text-[11px] font-bold text-white">Claim</Text>
                    )}
                  </Pressable>
                </MotiView>
              );
            })}
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
