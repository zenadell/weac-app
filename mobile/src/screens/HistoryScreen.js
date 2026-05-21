import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Swords } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { useGame } from "../lib/game-store";

export default function HistoryScreen() {
  const navigation = useNavigation();
  const game = useGame();
  const matches = game.profile?.matches || [];
  const wins = matches.filter(m => m.won).length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;

  // Compute a simple time string like "2h", "1m", "Just now"
  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <AppShell>
      <PageTransition>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <Pressable onPress={() => navigation.navigate("Profile")} className="size-10 items-center justify-center rounded-2xl bg-white border border-black/5" style={shadowSoft}>
              <ArrowLeft size={16} color="#1B1A2E" />
            </Pressable>
            <Text className="text-sm font-semibold text-muted-foreground">Match history</Text>
            <View className="size-10" />
          </View>

          <View className="px-6 pb-4">
            <Text className="text-[1.9rem] font-semibold leading-tight text-ink" style={{ fontSize: 30 }}>{matches.length} duels</Text>
            <Text className="text-sm text-muted-foreground">{winRate}% win rate</Text>
          </View>

          <View className="px-6" style={{ gap: 10 }}>
            {matches.length === 0 && (
              <Text className="text-center text-sm text-muted-foreground py-8">No matches played yet.</Text>
            )}
            {matches.map((m, i) => (
              <MotiView key={i} from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: i * 60 }}>
                <View className="flex-row items-center gap-3 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
                  <Gradient name={m.won ? "mint" : "rose"} className="size-12 items-center justify-center rounded-2xl">
                    <Text className="text-lg font-bold text-white">{m.won ? "W" : "L"}</Text>
                  </Gradient>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink">vs {m.opp}</Text>
                    <Text className="text-[11px] text-muted-foreground">{m.subject} · {timeAgo(m.ts)}</Text>
                  </View>
                  <Text className="text-sm font-bold tabular-nums text-ink">{m.my}-{m.oppScore}</Text>
                </View>
              </MotiView>
            ))}
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
