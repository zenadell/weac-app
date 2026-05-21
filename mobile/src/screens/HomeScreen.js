import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView, MotiImage } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Flame, Sparkles, Target, Zap } from "lucide-react-native";
import AppShell from "../components/AppShell";
import Header from "../components/Header";
import SubjectCard from "../components/SubjectCard";
import PageTransition from "../components/PageTransition";
import GameHub from "../components/GameHub";
import { useGame } from "../lib/game-store";
import heroRings from "../../assets/lovable/hero-rings.png";
import { subjectList } from "../lib/subjects";

export default function HomeScreen() {
  const navigation = useNavigation();
  const game = useGame();
  
  const OPPS = ["King's College", "Adisadel", "Presec Legon", "St. Jude's", "Corona"];
  const dayIndex = new Date().getDate();
  const oppSchool = OPPS[dayIndex % OPPS.length];
  const mySchool = game?.profile?.school || "Your School";

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <Header />

          {/* Epic Hero Section - "Skills to Pump" Dark Mode Integration */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 18, delay: 50 }}
            className="px-6 pb-6"
          >
            <Pressable onPress={() => navigation.navigate("Duel")}>
              <View
                className="relative rounded-[40px] p-8 border border-white/5 overflow-hidden items-center text-center bg-[#1C1C24]"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 24 },
                  shadowOpacity: 0.3,
                  shadowRadius: 32,
                  elevation: 15,
                }}
              >
                {/* Accent Glow */}
                <View className="absolute inset-0 bg-primary/10" />
                <MotiImage
                  source={heroRings}
                  from={{ rotate: "0deg", scale: 0.9 }}
                  animate={{ rotate: "360deg", scale: 1.1 }}
                  transition={{ loop: true, type: "timing", duration: 40000 }}
                  className="absolute inset-0 size-[400px] -left-12 -top-12 opacity-30"
                  resizeMode="contain"
                  pointerEvents="none"
                  style={{ tintColor: "#FA675E" }}
                />

                <View className="items-center z-10 w-full pt-2 pb-2">
                  <View className="flex-row items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 border border-primary/30">
                    <Zap size={14} color="#FA675E" fill="#FA675E" />
                    <Text className="text-[11px] font-black uppercase tracking-widest text-primary">Live Arena</Text>
                  </View>

                  <View className="mt-8 mb-10 items-center">
                    <Text className="text-[2.25rem] font-black tracking-tight leading-[1.05] text-white text-center" numberOfLines={2}>
                      {mySchool}{'\n'}vs {oppSchool}
                    </Text>
                    <Text className="text-[14px] font-medium text-muted-foreground mt-3 text-center px-4">
                      Biology · Chemistry · 60s sprint
                    </Text>
                  </View>

                  <View className="w-full flex-row justify-center items-center gap-2 rounded-full bg-white px-6 h-16 shadow-xl">
                    <Text className="text-[17px] font-black text-[#121214] tracking-wide">Enter Arena</Text>
                    <Sparkles size={18} color="#FA675E" fill="#FA675E" />
                  </View>
                </View>
              </View>
            </Pressable>
          </MotiView>

          {/* Quick Stats Grid */}
          <View className="flex-row px-6 pb-8 gap-4">
            <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 100 }} className="flex-1">
              <View className="rounded-[28px] bg-[#1C1C24] p-5 border border-white/5 items-center">
                <Flame size={28} color="#FFB63B" fill="#FFB63B" />
                <Text className="text-xl font-black text-white mt-2">{game?.streak || 0}</Text>
                <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Day Streak</Text>
              </View>
            </MotiView>
            <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 150 }} className="flex-1">
              <View className="rounded-[28px] bg-[#1C1C24] p-5 border border-white/5 items-center">
                <Target size={28} color="#30C5A0" />
                <Text className="text-xl font-black text-white mt-2">50 XP</Text>
                <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Daily Quest</Text>
              </View>
            </MotiView>
          </View>

          {/* Skills To Pump! (Exact replication of Image 3 UI) */}
          <View className="bg-[#121214] pt-4 px-6">
            <Text className="text-[2.75rem] font-black tracking-tighter text-white mb-6 leading-tight">
              Skills{'\n'}To Pump!
            </Text>

            <View className="flex-row flex-wrap justify-between" style={{ gap: 16 }}>
              {subjectList.map((s, i) => {
                const colors = ["#4C3297", "#FA675E", "#30C5A0", "#FFB63B"];
                return (
                  <MotiView
                    key={s.id}
                    from={{ opacity: 0, scale: 0.95, translateY: 15 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: "spring", delay: 200 + i * 50, damping: 20 }}
                    style={{ width: "47%" }}
                  >
                    <SubjectCard
                      title={s.name}
                      subtitle={s.name}
                      bgColor={colors[i % 4]}
                      image={s.image}
                      onPress={() => navigation.navigate("Subject", { id: s.id })}
                    />
                  </MotiView>
                );
              })}
            </View>
            
            {/* Sub Nav exactly like Design 3 */}
            <View className="flex-row items-center justify-between mt-12 mb-6 px-2">
              <Text className="text-white/40 font-black text-[12px] tracking-widest uppercase">‹ LESSON PLAN</Text>
              <Text className="text-white font-black text-[12px] tracking-widest uppercase">YOUR PROGRESS ›</Text>
            </View>

            <GameHub />
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}
