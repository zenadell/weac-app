import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Check, Coins, Zap } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { useGame } from "../lib/game-store";
import { popBurst } from "../lib/confetti";
import { LinearGradient } from "expo-linear-gradient";

const COMMITMENT_TARGETS = {
  casual: { min: 5, multiplier: 1 },
  regular: { min: 15, multiplier: 1.5 },
  serious: { min: 30, multiplier: 2 },
  insane: { min: 60, multiplier: 3 },
};

export default function QuestsScreen() {
  const navigation = useNavigation();
  const { quests, claimQuest, progressQuest, profile } = useGame();
  
  const daily = quests.filter((q) => q.type === "daily");
  const weekly = quests.filter((q) => q.type === "weekly");
  
  const commitment = profile?.commitment || "regular";
  const target = COMMITMENT_TARGETS[commitment] || COMMITMENT_TARGETS.regular;

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
            <View className="px-4 py-2 rounded-full bg-[#1C1C24] border border-white/5 flex-row items-center gap-2">
              <Zap size={14} color="#30C5A0" />
              <Text className="text-[11px] font-black text-white uppercase tracking-widest">{target.min} min Daily Goal</Text>
            </View>
            <View className="size-12" />
          </View>

          <View className="px-6 pb-6">
            <Text className="text-[2.5rem] font-black tracking-tighter text-white mb-2 leading-none">Bounties</Text>
            <Text className="text-base text-muted-foreground font-medium">Clear missions to earn XP and loot.</Text>
          </View>

          <Section title="Daily Drops" items={daily} onClaim={(id) => { claimQuest(id); popBurst(0.5, 0.5); }} onProgress={progressQuest} multiplier={target.multiplier} />
          <Section title="Weekly Epics" items={weekly} onClaim={(id) => { claimQuest(id); popBurst(0.5, 0.5); }} onProgress={progressQuest} accent multiplier={target.multiplier} />
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

function Section({ title, items, onClaim, onProgress, accent, multiplier }) {
  return (
    <View className="px-6 pt-4">
      <Text className="mb-4 text-sm font-black text-muted-foreground uppercase tracking-widest">{title}</Text>
      <View style={{ gap: 16 }}>
        <AnimatePresence>
          {items.map((q, i) => {
            const done = q.progress >= q.goal;
            const pct = Math.min(100, (q.progress / q.goal) * 100);
            const boostedXp = Math.round(q.xp * multiplier);
            
            const cardCore = (
              <View>
                <View className="flex-row items-start gap-4">
                  <View className={`size-14 items-center justify-center rounded-2xl ${accent ? "bg-white/20" : "bg-[#2A2A35]"}`}>
                    <Text style={{ fontSize: 24 }}>{q.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-[17px] font-black ${accent ? "text-white" : "text-white"}`}>{q.title}</Text>
                    <Text className={`text-xs font-medium mt-1 ${accent ? "text-white/80" : "text-muted-foreground"}`}>{q.desc}</Text>
                    <View className="mt-3 flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1.5 bg-[#121214]/40 px-2 py-1 rounded-md">
                        <Zap size={12} color={accent ? "#fff" : "#FFB63B"} fill={accent ? "#fff" : "#FFB63B"} />
                        <Text className={`text-[11px] font-bold ${accent ? "text-white" : "text-[#FFB63B]"}`}>{boostedXp} XP</Text>
                      </View>
                      <View className="flex-row items-center gap-1.5 bg-[#121214]/40 px-2 py-1 rounded-md">
                        <Coins size={12} color={accent ? "#fff" : "#30C5A0"} fill={accent ? "#fff" : "#30C5A0"} />
                        <Text className={`text-[11px] font-bold ${accent ? "text-white" : "text-[#30C5A0]"}`}>{q.coins}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => (done ? onClaim(q.id) : onProgress(q.id, 1))}
                    className={`h-10 items-center justify-center rounded-full px-4 ${
                      done ? "bg-primary" : accent ? "bg-white/20" : "bg-[#2A2A35]"
                    }`}
                  >
                    {done ? (
                      <View className="flex-row items-center gap-1">
                        <Check size={14} color="#121214" strokeWidth={3} />
                        <Text className="text-[13px] font-black text-[#121214]">CLAIM</Text>
                      </View>
                    ) : (
                      <Text className={`text-[13px] font-black ${accent ? "text-white" : "text-white"}`}>TRACK</Text>
                    )}
                  </Pressable>
                </View>
                
                <View className="mt-4 flex-row items-center gap-3">
                  <View className={`flex-1 h-2 overflow-hidden rounded-full ${accent ? "bg-white/20" : "bg-[#09090B]"}`}>
                    <MotiView
                      from={{ width: "0%" }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 800 }}
                      className={`h-full rounded-full ${accent ? "bg-white" : "bg-primary"}`}
                    />
                  </View>
                  <Text className={`text-[11px] font-black tabular-nums ${accent ? "text-white/70" : "text-muted-foreground"}`}>
                    {q.progress}/{q.goal}
                  </Text>
                </View>
              </View>
            );

            return (
              <MotiView
                key={q.id}
                from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 50 }}
              >
                {accent ? (
                  <LinearGradient 
                    colors={['#9F7AEA', '#4C3297']} 
                    className="rounded-[32px] p-5 border border-white/10"
                    style={{ shadowColor: "#9F7AEA", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}
                  >
                    {cardCore}
                  </LinearGradient>
                ) : (
                  <View className="rounded-[32px] bg-[#1C1C24] p-5 border border-white/5">
                    {cardCore}
                  </View>
                )}
              </MotiView>
            );
          })}
        </AnimatePresence>
        {items.length === 0 && (
          <View className="rounded-[32px] bg-[#1C1C24] p-8 border border-white/5 items-center justify-center">
            <Text className="text-center text-[15px] font-bold text-muted-foreground">All bounties claimed. Fresh ones drop at midnight.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
