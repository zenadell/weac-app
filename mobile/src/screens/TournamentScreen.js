// 1:1 port of src/routes/tournament.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Trophy, Users, Coins, Gem, Crown, Zap } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";

function nextSevenPM() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(19, 0, 0, 0);
  if (now.getTime() >= target.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime();
}

export default function TournamentScreen() {
  const navigation = useNavigation();
  const [now, setNow] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [targetTs, setTargetTs] = useState(0);

  useEffect(() => {
    setTargetTs(nextSevenPM());
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, targetTs - (now ?? targetTs));
  const h = Math.floor(diff / 3.6e6);
  const m = Math.floor((diff % 3.6e6) / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);

  const players = 2847;
  const prizePool = 12500;

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <Pressable
              onPress={() => navigation.navigate("Home")}
              className="size-11 items-center justify-center rounded-2xl bg-white border border-black/5"
              style={shadowSoft}
            >
              <ArrowLeft size={20} color="#1B1A2E" strokeWidth={2.4} />
            </Pressable>
            <Text className="text-sm font-semibold text-muted-foreground">Nightly Bracket</Text>
            <View className="size-11" />
          </View>

          {/* Hero countdown */}
          <View className="px-6 pb-6">
            <MotiView from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }}>
              <Gradient name="lilac" className="relative rounded-[36px] p-7 border border-black/5" style={shadowPop}>
                <View className="flex-row items-center gap-2 self-start rounded-full bg-white/25 px-3 py-1">
                  <Crown size={14} color="#fff" />
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-white">Season 4 · Galaxy</Text>
                </View>
                <Text className="mt-3 text-[1.65rem] font-semibold leading-tight text-white" style={{ fontSize: 26 }}>
                  Tonight's Throne Bracket
                </Text>
                <Text className="text-sm text-white/85">Doors open at 7:00 PM · 64 seats</Text>

                <View className="mt-6 flex-row gap-2">
                  {[
                    { v: h, l: "HRS" },
                    { v: m, l: "MIN" },
                    { v: s, l: "SEC" },
                  ].map((u, i) => (
                    <View key={i} className="flex-1 rounded-2xl bg-ink/35 px-2 py-3 items-center">
                      <Text className="text-3xl font-bold tabular-nums text-white">{String(u.v).padStart(2, "0")}</Text>
                      <Text className="text-[10px] font-bold tracking-wider text-white/80">{u.l}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => setRegistered((r) => !r)}
                  className={`mt-6 h-12 w-full flex-row items-center justify-center gap-2 rounded-2xl ${
                    registered ? "bg-mint" : "bg-white"
                  }`}
                  style={shadowPop}
                >
                  <Text className={`text-sm font-semibold ${registered ? "text-ink" : "text-royal"}`}>
                    {registered ? "✓ You're registered" : "Reserve your seat (free)"}
                  </Text>
                  {!registered && <Zap size={16} color="#9575CD" />}
                </Pressable>
              </Gradient>
            </MotiView>
          </View>

          {/* Prize + players */}
          <View className="px-6 pb-6 flex-row gap-3">
            <Stat icon={<Trophy size={20} color="#fff" />} grad="peach" label="Prize pool" value={`${prizePool.toLocaleString()}`} sub="coins + rare card" />
            <Stat icon={<Users size={20} color="#1B1A2E" />} grad="butter" dark label="Registered" value={players.toLocaleString()} sub="2.1k in your region" />
          </View>

          {/* Prize breakdown */}
          <View className="px-6 pb-6">
            <Text className="px-1 pb-3 text-base font-semibold text-ink">Champion rewards</Text>
            <View style={{ gap: 8 }}>
              {[
                { rank: "🥇 1st", coins: 5000, gems: 25, extra: "Throne card + crown badge" },
                { rank: "🥈 2nd", coins: 2500, gems: 15, extra: "Champion banner" },
                { rank: "🥉 3rd", coins: 1500, gems: 10, extra: "Bronze medallion" },
                { rank: "Top 8", coins: 500, gems: 3, extra: "Featured on leaderboard" },
                { rank: "Top 32", coins: 150, gems: 1, extra: "Participation XP" },
              ].map((p, i) => (
                <MotiView
                  key={p.rank}
                  from={{ opacity: 0, translateX: -8 }} animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 50 * i }}
                  className="flex-row items-center gap-3 rounded-2xl bg-white p-4 border border-black/5"
                  style={shadowSoft}
                >
                  <Text className="w-14 text-sm font-bold text-ink">{p.rank}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink">{p.extra}</Text>
                    <Text className="text-[11px] text-muted-foreground">Auto-credited at end</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-row items-center gap-1 rounded-full bg-butter/40 px-2 py-1">
                      <Coins size={12} color="#FFD54F" />
                      <Text className="text-xs font-semibold text-ink">{p.coins}</Text>
                    </View>
                    <View className="flex-row items-center gap-1 rounded-full bg-lilac/30 px-2 py-1">
                      <Gem size={12} color="#9575CD" />
                      <Text className="text-xs font-semibold text-ink">{p.gems}</Text>
                    </View>
                  </View>
                </MotiView>
              ))}
            </View>
          </View>

          {/* Format */}
          <View className="px-6 pb-10">
            <Text className="px-1 pb-3 text-base font-semibold text-ink">How it works</Text>
            <View className="flex-row gap-3">
              {[
                { n: 1, t: "Register", s: "Free seat" },
                { n: 2, t: "Brackets", s: "Single-elim" },
                { n: 3, t: "Crown", s: "Champion glory" },
              ].map((step) => (
                <View key={step.n} className="flex-1 rounded-2xl bg-white p-4 items-center border border-black/5" style={shadowSoft}>
                  <Gradient name="mint" className="size-8 items-center justify-center rounded-full">
                    <Text className="text-xs font-bold text-ink">{step.n}</Text>
                  </Gradient>
                  <Text className="mt-2 text-sm font-semibold text-ink">{step.t}</Text>
                  <Text className="text-[11px] text-muted-foreground">{step.s}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {registered && (
          <MotiView
            from={{ translateY: 100, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }}
            className="absolute bottom-24 left-4 right-4 rounded-2xl bg-ink p-3"
            style={shadowPop}
          >
            <Text className="text-sm font-semibold text-white">🔔 Reminder set for 6:55 PM</Text>
            <Text className="text-xs text-white/80">We'll ping you 5 minutes before doors open.</Text>
          </MotiView>
        )}
      </PageTransition>
    </AppShell>
  );
}

function Stat({ icon, grad, dark, label, value, sub }) {
  return (
    <Gradient name={grad} className="flex-1 rounded-3xl p-5 border border-black/5" style={shadowSoft}>
      <View className={`size-9 items-center justify-center rounded-xl ${dark ? "bg-ink/15" : "bg-white/25"}`}>{icon}</View>
      <Text className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${dark ? "text-ink/70" : "text-white/85"}`}>{label}</Text>
      <Text className={`text-2xl font-bold tabular-nums ${dark ? "text-ink" : "text-white"}`}>{value}</Text>
      <Text className={`text-[11px] ${dark ? "text-ink/60" : "text-white/75"}`}>{sub}</Text>
    </Gradient>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
