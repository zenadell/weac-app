import React, { useEffect } from "react";
import { View, Text, Pressable, ScrollView, Dimensions, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Flame, Play, Target, Trophy, Zap, Crown, Star, Shield, LayoutGrid } from "lucide-react-native";
import AppShell from "../components/AppShell";
import { useGame } from "../lib/game-store";
import { subjectList } from "../lib/subjects";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, interpolate } from "react-native-reanimated";

const { width } = Dimensions.get("window");

function PlayButton() {
  const pulse = useSharedValue(0);
  const navigation = useNavigation();

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.03]) }],
  }));

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <Pressable onPress={() => navigation.navigate("Duel")} style={styles.playButtonShadow}>
        <LinearGradient
          colors={['#FA675E', '#E5463D']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.playButton}
        >
          <Zap size={28} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.playButtonText}>ENTER ARENA</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const game = useGame();
  
  const { level, xp, xpToNext, profile } = game;
  const pct = Math.min(100, (xp / xpToNext) * 100);

  return (
    <AppShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* TOP HUD (Heads Up Display) */}
        <MotiView 
          from={{ opacity: 0, translateY: -20 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          className="px-6 pt-16 pb-6 flex-row items-center justify-between"
        >
          {/* Player Profile & League */}
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => navigation.navigate("Profile")}>
              <View className="relative">
                <LinearGradient
                  colors={['#30C5A0', '#1C8A6E']}
                  style={styles.avatarBorder}
                >
                  <View className="size-14 rounded-full bg-[#121214] items-center justify-center">
                    <Text className="text-xl font-black text-white">{profile?.name?.charAt(0) || "P"}</Text>
                  </View>
                </LinearGradient>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{level}</Text>
                </View>
              </View>
            </Pressable>
            <View>
              <Text style={styles.playerName}>{profile?.name || "Player 1"}</Text>
              <Text style={styles.leagueText}>Emerald League</Text>
            </View>
          </View>

          {/* Resources / Streak */}
          <View className="flex-row items-center gap-3">
            <View style={styles.streakBadge}>
              <Flame size={16} color="#FFB63B" fill="#FFB63B" />
              <Text style={styles.streakText}>{game?.streak || 0}</Text>
            </View>
          </View>
        </MotiView>

        {/* MAIN LOBBY DISPLAY */}
        <View className="px-6 gap-6">
          
          {/* Massive Action Button */}
          <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 100 }}>
            <PlayButton />
          </MotiView>

          {/* Player Stats Grid */}
          <View className="flex-row gap-4">
            {/* Rank Box */}
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 150 }} className="flex-1">
              <View style={[styles.statBox, { borderColor: 'rgba(255, 182, 59, 0.2)' }]}>
                <View className="absolute -right-4 -top-4 opacity-10">
                  <Crown size={100} color="#FFB63B" />
                </View>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 182, 59, 0.15)' }]}>
                  <Trophy size={20} color="#FFB63B" strokeWidth={2.5} />
                </View>
                <View className="mt-4">
                  <Text style={styles.statValue}>#42</Text>
                  <Text style={styles.statLabel}>Global Rank</Text>
                </View>
              </View>
            </MotiView>

            {/* Daily Bounty */}
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }} className="flex-1">
              <View style={[styles.statBox, { borderColor: 'rgba(48, 197, 160, 0.2)' }]}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(48, 197, 160, 0.15)' }]}>
                  <Target size={20} color="#30C5A0" strokeWidth={2.5} />
                </View>
                <View className="mt-4 flex-1 justify-between">
                  <View>
                    <Text style={styles.statValue}>Bounty</Text>
                    <Text style={styles.statLabel}>Win 3 Duels</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '66%', backgroundColor: '#30C5A0' }]} />
                  </View>
                </View>
              </View>
            </MotiView>
          </View>

        </View>

        {/* SKILL TREES / SUBJECTS CAROUSEL */}
        <View className="mt-10">
          <View className="flex-row items-end justify-between px-6 mb-5">
            <View className="flex-row items-center gap-2">
              <LayoutGrid size={22} color="#FFFFFF" />
              <Text style={styles.sectionTitle}>Skill Trees</Text>
            </View>
            <Text style={styles.viewAllText}>View All</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            snapToInterval={width * 0.4 + 16}
            decelerationRate="fast"
          >
            {subjectList.map((s, i) => {
              const colors = ["#90CAF9", "#CE93D8", "#FFB63B", "#30C5A0", "#FA675E"];
              const bgColor = colors[i % colors.length];
              
              return (
                <MotiView
                  key={s.id}
                  from={{ opacity: 0, scale: 0.9, translateX: 50 }}
                  animate={{ opacity: 1, scale: 1, translateX: 0 }}
                  transition={{ type: "spring", delay: 250 + i * 50 }}
                >
                  <Pressable onPress={() => navigation.navigate("Subject", { id: s.id })}>
                    <View style={[styles.skillCard, { backgroundColor: bgColor }]}>
                      {/* Abstract Background Icon */}
                      <View className="absolute -right-6 -bottom-6 opacity-20">
                        <Star size={120} color="#FFFFFF" fill="#FFFFFF" />
                      </View>

                      <View className="size-12 rounded-[16px] bg-black/20 items-center justify-center backdrop-blur-md z-10 border border-white/10">
                        <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
                      </View>

                      <View className="z-10 mt-auto">
                        <Text style={styles.skillName}>{s.name}</Text>
                        <Text style={styles.skillLevel}>Mastery: 12%</Text>
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

const styles = StyleSheet.create({
  // Top HUD
  avatarBorder: {
    padding: 3,
    borderRadius: 999,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#30C5A0',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#09090B',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  playerName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  leagueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#30C5A0',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 182, 59, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 182, 59, 0.3)',
  },
  streakText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFB63B',
  },

  // Main Action Button
  playButtonShadow: {
    shadowColor: "#FA675E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 15,
  },
  playButton: {
    paddingVertical: 28,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  // Stat Boxes
  statBox: {
    backgroundColor: '#15151A',
    borderRadius: 28,
    padding: 20,
    height: 160,
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: '#09090B',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Skill Trees
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7B7995',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingBottom: 2,
  },
  skillCard: {
    width: width * 0.4,
    height: 220,
    borderRadius: 28,
    padding: 16,
    overflow: 'hidden',
  },
  skillName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#121214',
    letterSpacing: -0.5,
  },
  skillLevel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
