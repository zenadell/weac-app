import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Settings, History, Shield, GraduationCap, ChevronRight, Zap, Target, Swords, Star } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { useGame } from "../lib/game-store";
import { LinearGradient } from "expo-linear-gradient";

const AVATAR_MAP = {
  speedster: Zap,
  warrior: Swords,
  mage: Star,
  guardian: Shield,
};

const PATHWAY_LABELS = {
  stem: "STEM Explorer",
  humanities: "Humanities Sage",
  languages: "Language Master",
  global: "Global Exams",
};

const legends = [
  { rank: 1, name: "NeonPhantom", xp: "12.4k", mine: false },
  { rank: 2, name: "PixelMage", xp: "11.2k", mine: false },
  { rank: 3, name: "Player 1", xp: "9.8k", mine: true },
  { rank: 4, name: "CyberRanger", xp: "9.1k", mine: false },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const game = useGame();
  const profile = game?.profile || {};
  
  const displayName = profile?.name || "Player 1";
  const AvatarIcon = AVATAR_MAP[profile?.avatarClass] || Star;
  const pathwayLabel = PATHWAY_LABELS[profile?.pathway] || profile?.gradeLevel || "Emerald League";

  const rows = [
    { icon: GraduationCap, label: "My Arsenal",      value: `${profile?.subjects?.length || 0} Subjects`, to: "Profile" },
    { icon: History,       label: "Combat Log",  value: "47 duels",  to: "History" },
    { icon: Settings,      label: "Preferences",    to: "Settings" },
    { icon: Shield,        label: "Privacy & Data", to: "Settings" },
  ];

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          
          {/* Hero Profile Block */}
          <View className="px-6 pt-16 pb-8">
            <MotiView
              from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full rounded-[40px] bg-purple p-8 items-center border border-white/10 relative overflow-hidden"
              style={{ shadowColor: "#4C3297", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 20 }}
            >
              <View className="absolute -left-10 -top-10 opacity-10">
                <Target size={200} color="#FFFFFF" strokeWidth={1} />
              </View>

              <View className="relative">
                <LinearGradient
                  colors={['#30C5A0', '#1C8A6E']}
                  style={{ padding: 4, borderRadius: 36 }}
                >
                  <View className="size-24 rounded-[32px] bg-[#121214] items-center justify-center border-4 border-black/50">
                    <AvatarIcon size={40} color="#FFFFFF" />
                  </View>
                </LinearGradient>
                <View className="absolute -bottom-3 -right-3 px-3 py-1 rounded-full bg-[#30C5A0] border-4 border-purple">
                  <Text className="text-[13px] font-black text-[#121214]">LVL {game.level || 1}</Text>
                </View>
              </View>

              <Text className="mt-8 text-[2.5rem] font-black text-white tracking-tight leading-none text-center">
                {displayName}
              </Text>
              <Text className="mt-3 text-[13px] font-bold text-white/70 uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full">
                {pathwayLabel}
              </Text>
            </MotiView>
          </View>

          {/* Bento Stats */}
          <View className="flex-row gap-4 px-6 mb-8">
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }} className="flex-1">
              <View className="rounded-[32px] bg-[#1C1C24] p-6 border border-white/5 items-center justify-center h-40">
                <Zap size={28} color="#FFB63B" fill="#FFB63B" />
                <Text className="mt-4 text-3xl font-black text-white tracking-tighter">{game.streak || 0}</Text>
                <Text className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Day Streak</Text>
              </View>
            </MotiView>

            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 150 }} className="flex-1">
              <View className="rounded-[32px] bg-[#1C1C24] p-6 border border-white/5 items-center justify-center h-40">
                <Text className="text-xl font-black text-[#30C5A0] tracking-tighter mb-2">XP</Text>
                <Text className="text-3xl font-black text-white tracking-tighter">
                  {game.xp > 1000 ? `${(game.xp / 1000).toFixed(1)}k` : String(game.xp || 0)}
                </Text>
                <Text className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total XP</Text>
              </View>
            </MotiView>
          </View>

          {/* Leaderboard Panel */}
          <View className="px-6 mb-8">
            <Text className="text-[2rem] font-black tracking-tight text-white mb-6">Local Legends</Text>
            <View className="overflow-hidden rounded-[32px] bg-[#1C1C24] border border-white/5 p-2">
              {legends.map((s, i) => (
                <MotiView
                  key={s.rank}
                  from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 200 + i * 50 }}
                  className={`flex-row items-center gap-4 p-4 rounded-[24px] ${s.mine ? "bg-primary/20 border border-primary/30" : "bg-transparent"}`}
                >
                  <Text className={`w-8 text-lg font-black ${s.rank === 1 ? "text-[#FFB63B]" : "text-muted-foreground"}`}>
                    #{s.rank}
                  </Text>
                  <Text className={`flex-1 text-[15px] font-bold ${s.mine ? "text-primary" : "text-white"}`}>{s.mine ? displayName : s.name}</Text>
                  {s.mine && (
                    <View className="rounded-full bg-primary px-3 py-1 mr-2">
                      <Text className="text-[10px] font-black text-[#121214]">YOU</Text>
                    </View>
                  )}
                  <Text className="text-[15px] font-black tabular-nums text-white/60">{s.xp}</Text>
                </MotiView>
              ))}
            </View>
          </View>

          {/* Action Rows */}
          <View className="px-6 gap-3">
            {rows.map(({ icon: Icon, label, value, to }, i) => (
              <MotiView key={label} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 + i * 50 }}>
                <Pressable
                  onPress={() => navigation.navigate(to)}
                  className="flex-row items-center gap-5 rounded-[28px] bg-[#1C1C24] p-5 border border-white/5"
                >
                  <View className="size-12 items-center justify-center rounded-[18px] bg-[#2A2A35]">
                    <Icon size={22} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-bold text-white">{label}</Text>
                    {value && <Text className="text-sm font-medium text-muted-foreground mt-0.5">{value}</Text>}
                  </View>
                  <ChevronRight size={20} color="#8E8E9F" />
                </Pressable>
              </MotiView>
            ))}
          </View>

        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}
