// 1:1 port of src/routes/quests.tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Check, Coins, Zap } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { useGame } from "../lib/game-store";
import { popBurst } from "../lib/confetti";

export default function QuestsScreen() {
  const navigation = useNavigation();
  const { quests, claimQuest, progressQuest } = useGame();
  const daily = quests.filter((q) => q.type === "daily");
  const weekly = quests.filter((q) => q.type === "weekly");

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
            <Text className="text-sm font-semibold text-muted-foreground">Quests</Text>
            <View className="size-10" />
          </View>

          <View className="px-6 pb-4">
            <Text className="text-[1.9rem] font-semibold leading-tight text-ink" style={{ fontSize: 30 }}>Today's missions</Text>
            <Text className="text-sm text-muted-foreground">Finish quests · earn XP, coins & gems</Text>
          </View>

          <Section title="Daily" items={daily} onClaim={(id) => { claimQuest(id); popBurst(0.5, 0.5); }} onProgress={progressQuest} />
          <Section title="Weekly" items={weekly} onClaim={(id) => { claimQuest(id); popBurst(0.5, 0.5); }} onProgress={progressQuest} accent />
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

function Section({ title, items, onClaim, onProgress, accent }) {
  return (
    <View className="px-6 pt-4">
      <Text className="mb-3 px-1 text-sm font-semibold text-muted-foreground">{title}</Text>
      <View style={{ gap: 12 }}>
        <AnimatePresence>
          {items.map((q, i) => {
            const done = q.progress >= q.goal;
            const pct = (q.progress / q.goal) * 100;
            const cardCore = (
              <View>
                <View className="flex-row items-start gap-3">
                  <View className={`size-12 items-center justify-center rounded-2xl ${accent ? "bg-white/25" : "bg-canvas"}`}>
                    <Text style={{ fontSize: 22 }}>{q.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold ${accent ? "text-white" : "text-ink"}`}>{q.title}</Text>
                    <Text className={`text-xs ${accent ? "text-white/80" : "text-muted-foreground"}`}>{q.desc}</Text>
                    <View className="mt-2 flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Zap size={12} color={accent ? "#fff" : "#F06292"} />
                        <Text className={`text-[11px] font-semibold ${accent ? "text-white" : "text-coral"}`}>{q.xp} XP</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Coins size={12} color={accent ? "#fff" : "#1B1A2E"} />
                        <Text className={`text-[11px] font-semibold ${accent ? "text-white" : "text-ink"}`}>{q.coins}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => (done ? onClaim(q.id) : onProgress(q.id, 1))}
                    className={`h-10 items-center justify-center rounded-full px-4 ${
                      done ? "bg-ink" : accent ? "bg-white/25" : "bg-canvas"
                    }`}
                  >
                    {done ? (
                      <View className="flex-row items-center gap-1">
                        <Check size={12} color="#fff" />
                        <Text className="text-xs font-bold text-white">Claim</Text>
                      </View>
                    ) : (
                      <Text className={`text-xs font-bold ${accent ? "text-white" : "text-ink"}`}>+ Track</Text>
                    )}
                  </Pressable>
                </View>
                <View className={`mt-3 h-1.5 overflow-hidden rounded-full ${accent ? "bg-white/25" : "bg-canvas"}`}>
                  <MotiView
                    from={{ width: "0%" }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 800 }}
                    className={`h-full rounded-full ${accent ? "bg-white" : "bg-ink"}`}
                  />
                </View>
                <Text className={`mt-1.5 text-[10px] tabular-nums ${accent ? "text-white/70" : "text-muted-foreground"}`}>
                  {q.progress}/{q.goal}
                </Text>
              </View>
            );

            return (
              <MotiView
                key={q.id}
                from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 50 }}
              >
                {accent ? (
                  <Gradient name="lilac" className="rounded-3xl p-4 border border-black/5" style={shadowSoft}>
                    {cardCore}
                  </Gradient>
                ) : (
                  <View className="rounded-3xl bg-white p-4 border border-black/5" style={shadowSoft}>
                    {cardCore}
                  </View>
                )}
              </MotiView>
            );
          })}
        </AnimatePresence>
        {items.length === 0 && (
          <View className="rounded-3xl bg-white p-6 border border-black/5" style={shadowSoft}>
            <Text className="text-center text-sm text-muted-foreground">All quests claimed. Fresh ones drop at midnight.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
