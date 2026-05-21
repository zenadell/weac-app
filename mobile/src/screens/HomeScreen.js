import React from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { MotiView, MotiImage } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Flame, Play, Target, Trophy, ArrowRight, Zap, Crown, User, ArrowUpRight } from "lucide-react-native";
import AppShell from "../components/AppShell";
import { useGame } from "../lib/game-store";
import { subjectList } from "../lib/subjects";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const game = useGame();
  
  const OPPS = ["King's College", "Adisadel", "Presec Legon", "St. Jude's", "Corona"];
  const dayIndex = new Date().getDate();
  const oppSchool = OPPS[dayIndex % OPPS.length];
  const mySchool = game?.profile?.school || "Your School";
  const { level, xp, xpToNext, coins, profile } = game;
  const pct = Math.min(100, (xp / xpToNext) * 100);

  return (
    <AppShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* NEW HEADER: Unified, Compact, Dynamic Island Style */}
        <MotiView 
          from={{ opacity: 0, translateY: -20 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          className="px-6 pt-16 pb-8 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => navigation.navigate("Profile")} className="relative">
              <View className="size-14 rounded-[18px] bg-[#2A2A35] items-center justify-center border border-white/10 overflow-hidden">
                <Text className="text-xl font-black text-white">{profile?.name?.charAt(0) || "A"}</Text>
              </View>
              {/* Level Badge overlapping */}
              <View className="absolute -bottom-2 -right-2 size-7 rounded-full bg-primary items-center justify-center border-2 border-[#121214]">
                <Text className="text-[11px] font-black text-white">{level}</Text>
              </View>
            </Pressable>
            <View>
              <Text className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">Welcome back</Text>
              <Text className="text-2xl font-black text-white tracking-tight">{profile?.name || "Player"}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <Pressable className="flex-row items-center gap-1.5 bg-[#1C1C24] px-3 py-2 rounded-full border border-white/5">
              <Flame size={16} color="#FFB63B" fill="#FFB63B" />
              <Text className="text-sm font-bold text-white">{game?.streak || 0}</Text>
            </Pressable>
          </View>
        </MotiView>

        {/* BENTO GRID DASHBOARD - Completely new structure */}
        <View className="px-6 gap-4">
          
          {/* Top Row: Massive "Next Match" Action Block */}
          <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 100 }}>
            <Pressable onPress={() => navigation.navigate("Duel")}>
              <View className="w-full rounded-[32px] bg-purple p-6 overflow-hidden relative">
                {/* Abstract graphic */}
                <View className="absolute -right-10 -bottom-10 opacity-20">
                  <Zap size={180} color="#FFFFFF" fill="#FFFFFF" />
                </View>
                
                <View className="flex-row items-center gap-2 mb-8">
                  <View className="bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                    <Text className="text-[11px] font-black tracking-widest text-white uppercase">Arena Live</Text>
                  </View>
                  <View className="size-2 rounded-full bg-[#FFB63B]" />
                </View>

                <Text className="text-[2.5rem] font-black tracking-tighter text-white leading-[1.1] mb-2 w-3/4">
                  {mySchool}{'\n'}
                  <Text className="text-white/60 text-3xl">vs</Text> {oppSchool}
                </Text>

                <View className="flex-row items-end justify-between mt-6">
                  <Text className="text-sm font-semibold text-white/80">60s Sprint • Chemistry</Text>
                  <View className="size-14 rounded-full bg-white items-center justify-center shadow-2xl">
                    <ArrowUpRight size={28} color="#4C3297" strokeWidth={3} />
                  </View>
                </View>
              </View>
            </Pressable>
          </MotiView>

          {/* Second Row: Two square bento boxes */}
          <View className="flex-row gap-4">
            {/* Quest Progress */}
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 150 }} className="flex-1">
              <View className="rounded-[32px] bg-[#1C1C24] p-5 h-48 border border-white/5 justify-between">
                <View className="size-10 rounded-full bg-green/20 items-center justify-center">
                  <Target size={20} color="#30C5A0" strokeWidth={2.5} />
                </View>
                <View>
                  <Text className="text-3xl font-black text-white tracking-tight">50<Text className="text-xl text-white/50">XP</Text></Text>
                  <Text className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mt-1">Daily Quest</Text>
                </View>
                <View className="h-1.5 w-full bg-[#121214] rounded-full overflow-hidden">
                  <View className="h-full bg-green rounded-full" style={{ width: '65%' }} />
                </View>
              </View>
            </MotiView>

            {/* Global Rank */}
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }} className="flex-1">
              <View className="rounded-[32px] bg-[#1C1C24] p-5 h-48 border border-white/5 justify-between relative overflow-hidden">
                <View className="absolute -right-4 -top-4 opacity-10">
                  <Trophy size={100} color="#FFB63B" />
                </View>
                <View className="size-10 rounded-full bg-yellow/20 items-center justify-center">
                  <Crown size={20} color="#FFB63B" strokeWidth={2.5} />
                </View>
                <View>
                  <Text className="text-3xl font-black text-white tracking-tight">#12</Text>
                  <Text className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mt-1">Global Rank</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="size-2 rounded-full bg-green" />
                  <Text className="text-xs font-bold text-white/70">Top 1% in Lagos</Text>
                </View>
              </View>
            </MotiView>
          </View>
        </View>

        {/* HORIZONTAL CAROUSEL - "Arsenal" instead of standard grid */}
        <View className="mt-12">
          <View className="flex-row items-end justify-between px-6 mb-6">
            <Text className="text-[2.25rem] font-black tracking-tight text-white leading-none">
              Arsenal
            </Text>
            <Text className="text-[12px] font-black tracking-widest text-primary uppercase pb-1">View All</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            snapToInterval={width * 0.45 + 16}
            decelerationRate="fast"
          >
            {subjectList.map((s, i) => {
              const colors = ["#FA675E", "#30C5A0", "#FFB63B", "#CE93D8", "#90CAF9"];
              const bgColor = colors[i % colors.length];
              
              return (
                <MotiView
                  key={s.id}
                  from={{ opacity: 0, scale: 0.9, translateX: 50 }}
                  animate={{ opacity: 1, scale: 1, translateX: 0 }}
                  transition={{ type: "spring", delay: 250 + i * 50 }}
                >
                  <Pressable onPress={() => navigation.navigate("Subject", { id: s.id })}>
                    <View 
                      className="rounded-[32px] overflow-hidden justify-between p-5 relative"
                      style={{ 
                        width: width * 0.45, 
                        height: 240, 
                        backgroundColor: bgColor 
                      }}
                    >
                      {/* Icon Container */}
                      <View className="size-12 rounded-2xl bg-white/20 items-center justify-center backdrop-blur-md z-10">
                        <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                      </View>

                      {/* Large rotated background text for modern feel */}
                      <Text 
                        className="absolute -right-8 bottom-12 text-[4rem] font-black text-black/10 uppercase tracking-tighter"
                        style={{ transform: [{ rotate: '-90deg' }] }}
                        numberOfLines={1}
                      >
                        {s.name}
                      </Text>

                      <View className="z-10">
                        <Text className="text-xl font-black text-white tracking-tight">{s.name}</Text>
                        <Text className="text-xs font-bold text-white/80 mt-1 uppercase tracking-widest">Level 1</Text>
                      </View>
                    </View>
                  </Pressable>
                </MotiView>
              );
            })}
          </ScrollView>
        </View>

      </ScrollView>
    </AppShell>
  );
}
