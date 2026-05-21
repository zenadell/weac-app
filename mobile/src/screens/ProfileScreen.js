// 1:1 port of src/routes/profile.tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Settings, History, Shield, GraduationCap, ChevronRight } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { useGame } from "../lib/game-store";

const schools = [
  { rank: 1, name: "Loyola Jesuit, Abuja", xp: "12.4k", mine: false },
  { rank: 2, name: "Achimota School, Accra", xp: "11.2k", mine: false },
  { rank: 3, name: "King's College, Lagos", xp: "9.8k", mine: true },
  { rank: 4, name: "Queen's College, Lagos", xp: "9.1k", mine: false },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const game = useGame();
  const profile = game?.profile || {};
  
  const displayName = profile?.name || "Ayo Bakare";
  const initials = displayName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const schoolName = profile?.school || "King's College";

  const stats = [
    { label: "Streak", value: `${game.streak || 0}d`, gradient: "peach" },
    { label: "XP",     value: game.xp > 1000 ? `${(game.xp / 1000).toFixed(1)}k` : String(game.xp || 0), gradient: "mint" },
    { label: "Rank",   value: "—", gradient: "lilac" },
  ];

  const rows = [
    { icon: GraduationCap, label: "My school",      value: schoolName, to: "Profile" },
    { icon: History,       label: "Match history",  value: "47 duels",  to: "History" },
    { icon: Settings,      label: "Preferences",    to: "Settings" },
    { icon: Shield,        label: "Privacy & data", to: "Settings" },
  ];

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <MotiView
            from={{ opacity: 0, translateY: -8 }} animate={{ opacity: 1, translateY: 0 }}
            className="px-6 pt-12 pb-6 items-center"
          >
            <Gradient name="peach" className="size-24 rounded-full p-1" style={shadowPop}>
              <View className="flex-1 items-center justify-center rounded-full bg-white">
                <Text className="text-3xl font-semibold text-ink">{initials || "A"}</Text>
              </View>
            </Gradient>
            <Text className="mt-4 text-2xl font-semibold text-ink">{displayName}</Text>
            <Text className="text-sm text-muted-foreground">{schoolName} · {profile?.country || "Lagos"}</Text>
          </MotiView>

          <View className="flex-row gap-3 px-6">
            {stats.map((s, i) => (
              <MotiView
                key={s.label}
                from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 100 + i * 80 }}
                style={{ flex: 1 }}
              >
                <Gradient name={s.gradient} className="rounded-2xl p-4 border border-black/5" style={shadowSoft}>
                  <Text className="text-xs font-medium uppercase tracking-wider text-white/80">{s.label}</Text>
                  <Text className="mt-1 text-2xl font-bold text-white">{s.value}</Text>
                </Gradient>
              </MotiView>
            ))}
          </View>

          <View className="px-6 pt-8">
            <Text className="mb-3 px-1 text-sm font-semibold text-muted-foreground">School leaderboard</Text>
            <View className="overflow-hidden rounded-[28px] bg-white border border-black/5" style={shadowSoft}>
              {schools.map((s, i) => (
                <MotiView
                  key={s.rank}
                  from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 200 + i * 60 }}
                  className={`flex-row items-center gap-4 p-4 ${i !== schools.length - 1 ? "border-b border-canvas" : ""} ${s.mine ? "bg-peach/10" : ""}`}
                >
                  <Text className={`w-6 text-sm font-bold ${s.rank === 1 ? "text-coral" : "text-muted-foreground"}`}>
                    {String(s.rank).padStart(2, "0")}
                  </Text>
                  <Text className="flex-1 text-sm font-medium text-ink">{s.name}</Text>
                  {s.mine && (
                    <View className="rounded-full bg-ink px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-white">YOU</Text>
                    </View>
                  )}
                  <Text className="text-sm font-semibold tabular-nums text-ink">{s.xp}</Text>
                </MotiView>
              ))}
            </View>
          </View>

          <View className="px-6 pt-8 pb-12" style={{ gap: 8 }}>
            {rows.map(({ icon: Icon, label, value, to }, i) => (
              <MotiView
                key={label}
                from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 400 + i * 50 }}
              >
                <Pressable
                  onPress={() => navigation.navigate(to)}
                  className="flex-row items-center gap-4 rounded-2xl bg-white p-4 border border-black/5"
                  style={shadowSoft}
                >
                  <View className="size-10 items-center justify-center rounded-xl bg-canvas">
                    <Icon size={20} color="#1B1A2E" strokeWidth={2.2} />
                  </View>
                  <Text className="flex-1 text-sm font-semibold text-ink">{label}</Text>
                  {value && <Text className="text-sm text-muted-foreground">{value}</Text>}
                  <ChevronRight size={16} color="#7B7995" />
                </Pressable>
              </MotiView>
            ))}
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
