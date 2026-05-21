// 1:1 port of src/routes/index.tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView, MotiImage } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Flame, Sparkles, Target } from "lucide-react-native";
import AppShell from "../components/AppShell";
import Header from "../components/Header";
import SubjectCard from "../components/SubjectCard";
import PageTransition from "../components/PageTransition";
import GameHub from "../components/GameHub";
import Gradient from "../components/Gradient";
import { MotiPressable } from "../components/primitives/MotiPressable";
import { useGame } from "../lib/game-store";
import heroRings from "../../assets/lovable/hero-rings.png";
import trophy from "../../assets/lovable/trophy.png";
import { subjectList } from "../lib/subjects";

export default function HomeScreen() {
  const navigation = useNavigation();
  const game = useGame();
  
  const OPPS = ["King's College", "Adisadel", "Presec Legon", "St. Jude's", "Corona"];
  // Deterministic random opponent based on current day so it doesn't flash
  const dayIndex = new Date().getDate();
  const oppSchool = OPPS[dayIndex % OPPS.length];
  
  const mySchool = game?.profile?.school || "Your School";

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <Header />

          {/* Hero Duel */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 18, delay: 50 }}
            className="px-6 pb-6"
          >
            <Pressable onPress={() => navigation.navigate("Duel")}>
              <Gradient
                name="peach"
                className="relative rounded-[40px] p-8 border border-black/5 overflow-hidden items-center text-center"
                style={shadowPop}
              >
                {/* Background Rotating Rings */}
                <MotiImage
                  source={heroRings}
                  from={{ rotate: "0deg", scale: 0.9 }}
                  animate={{ rotate: "360deg", scale: 1.1 }}
                  transition={{ loop: true, type: "timing", duration: 40000 }}
                  className="absolute inset-0 size-[400px] -left-12 -top-12 opacity-40"
                  resizeMode="contain"
                  pointerEvents="none"
                />

                <View className="items-center z-10 w-full pt-4 pb-2">
                  {/* Floating Tags */}
                  <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-md border border-white/30">
                    <MotiView
                      from={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ loop: true, type: "timing", duration: 1500 }}
                      className="absolute left-4 size-2.5 rounded-full bg-white"
                    />
                    <View className="size-2.5 rounded-full bg-white" />
                    <Text className="text-[11px] font-extrabold uppercase tracking-widest text-white">Live · 4.2k in arena</Text>
                  </View>

                  {/* Massive Centered Text */}
                  <View className="mt-8 mb-10 items-center">
                    <Text className="text-[2.15rem] font-black tracking-tight leading-[1.05] text-white text-center" numberOfLines={2} adjustsFontSizeToFit>
                      {mySchool}{'\n'}vs {oppSchool}
                    </Text>
                    <Text className="text-[13px] font-medium text-white/80 mt-3 text-center px-4">
                      Biology · Chemistry · 60s sprint
                    </Text>
                  </View>

                  {/* Huge Action Button */}
                  <MotiPressable
                    className="w-full flex-row justify-center items-center gap-2 rounded-[24px] bg-ink px-6 h-16 shadow-xl"
                  >
                    <Text className="text-[17px] font-black text-white tracking-wide">Enter Arena</Text>
                    <Sparkles size={18} color="#FF9E80" fill="#FF9E80" />
                  </MotiPressable>
                </View>
              </Gradient>
            </Pressable>
          </MotiView>

          {/* Streak strip */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 150, duration: 500 }}
            className="px-6 pb-4"
          >
            <Pressable onPress={() => navigation.navigate("Profile")}>
              <View className="flex-row items-center gap-3 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
                <Gradient name="butter" className="size-10 items-center justify-center rounded-full">
                  <Flame size={20} color="#1B1A2E" strokeWidth={2.5} />
                </Gradient>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink">{game?.streak || 0}-day streak</Text>
                  <Text className="text-xs text-muted-foreground">Top 3% in Lagos this week</Text>
                </View>
                <View className="flex-row" style={{ marginLeft: -8 }}>
                  {["mint", "lilac", "peach"].map((g, i) => (
                    <Gradient key={i} name={g} className="size-7 rounded-full border-2 border-white" style={{ marginLeft: -8 }} />
                  ))}
                </View>
              </View>
            </Pressable>
          </MotiView>

          {/* Daily Challenge */}
          <MotiView
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 150, damping: 20 }}
            className="px-6 pb-6"
          >
            <Pressable onPress={() => navigation.navigate("Tutor")}>
              <View className="relative flex-row items-center gap-4 rounded-[32px] p-5 bg-white border border-black/5 overflow-hidden" style={shadowSoft}>
                <View className="absolute right-0 top-0 bottom-0 w-32 bg-lilac/10" />
                <MotiView
                  from={{ rotate: "0deg" }}
                  animate={{ rotate: "8deg" }}
                  transition={{ loop: true, type: "timing", duration: 3000 }}
                  className="size-12 items-center justify-center rounded-full bg-white/25"
                >
                  <Target size={24} color="#fff" strokeWidth={2.4} />
                </MotiView>
                <View className="flex-1">
                  <Text className="text-[11px] font-bold uppercase tracking-wider text-lilac mb-0.5">Daily challenge</Text>
                  <Text className="text-[15px] font-bold tracking-tight text-ink">Solve 5 in under 90s</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                     <Text className="text-[11px] font-semibold text-muted-foreground">+50 XP Reward</Text>
                  </View>
                </View>
                <View className="size-10 rounded-full bg-canvas items-center justify-center border border-black/5">
                  <Text className="text-xl text-ink font-light">→</Text>
                </View>
              </View>
            </Pressable>
          </MotiView>

          {/* Skills To Pump! (Design 3 strict replication) */}
          <View className="bg-[#121214] mt-8 pt-8 pb-12 rounded-t-[40px] px-6">
            <Text className="text-[2.25rem] font-black tracking-tight text-white mb-6 leading-tight">
              Skills{'\n'}To Pump!
            </Text>

            <View className="flex-row flex-wrap justify-between" style={{ gap: 14 }}>
              {subjectList.map((s, i) => {
                // Exact hex colors from Design 3
                const colors = ["#4C3297", "#FA675E", "#30C5A0", "#FFB63B"];
                return (
                  <MotiView
                    key={s.id}
                    from={{ opacity: 0, scale: 0.95, translateY: 15 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: "spring", delay: 100 + i * 50, damping: 20 }}
                    style={{ width: "47.5%" }}
                  >
                    <SubjectCard
                      title={s.name}
                      subtitle={s.name}
                      bgColor={colors[i % 4]}
                      textDark={false}
                      image={s.image}
                      onPress={() => navigation.navigate("Subject", { id: s.id })}
                    />
                  </MotiView>
                );
              })}
            </View>

            {/* Sub Nav exactly like Design 3 */}
            <View className="flex-row items-center justify-between mt-8 mb-6 px-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-black text-[11px] tracking-widest uppercase">‹ LESSON PLAN</Text>
              </View>
              <Text className="text-white font-black text-[11px] tracking-widest uppercase">YOUR PROGRESS ›</Text>
            </View>

            {/* Replicating GameHub as horizontal list items matching Design 3 */}
            <GameHub />
          </View>

          {/* Achievement */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 550, duration: 500 }}
            className="px-6 pt-8"
          >
            <Pressable onPress={() => navigation.navigate("Vault")}>
              <View className="flex-row items-center gap-4 rounded-[28px] bg-white p-5 border border-black/5" style={shadowSoft}>
                <Gradient name="butter" className="size-16 items-center justify-center rounded-2xl border border-black/5">
                  <MotiImage
                    source={trophy}
                    from={{ rotate: "-5deg" }}
                    animate={{ rotate: "5deg" }}
                    transition={{ loop: true, type: "timing", duration: 3000 }}
                    style={{ width: 56, height: 56 }}
                    resizeMode="contain"
                  />
                </Gradient>
                <View className="flex-1">
                  <Text className="font-semibold text-ink">Weekly MVP card unlocked</Text>
                  <Text className="text-sm text-muted-foreground">Top 3 in Lagos Island · Tap to claim</Text>
                </View>
                <Text className="text-2xl">→</Text>
              </View>
            </Pressable>
          </MotiView>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 3,
};
const shadowPop = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.18,
  shadowRadius: 30,
  elevation: 10,
};
