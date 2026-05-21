// 1:1 port of src/components/GameHub.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Gift, ListChecks, ShoppingBag, Trophy, Crown, Users } from "lucide-react-native";
import Gradient from "./Gradient";
import { useGame } from "../lib/game-store";
import { MotiPressable } from "./primitives/MotiPressable";

export default function GameHub() {
  const navigation = useNavigation();
  const { quests, spinAvailableAt, seasonTier, powerups } = useGame();
  const claimable = quests.filter((q) => q.progress >= q.goal).length;
  const spinReady = Date.now() >= spinAvailableAt;
  const ownedPowerups = powerups.reduce((a, p) => a + p.owned, 0);

  const items = [
    { to: "Tournament", label: "7PM Throne",  sub: "Nightly bracket · 12.5k pool",          icon: Crown,       gradient: "lilac",  badge: "LIVE",                                 dark: false },
    { to: "Squad",      label: "Squad Battle",sub: "3v3 with your friends",                  icon: Users,       gradient: "rose",   badge: "NEW",                                  dark: false },
    { to: "Spin",       label: "Daily Spin",  sub: spinReady ? "Free reward · tap to spin" : "Come back tomorrow", icon: Gift,        gradient: "peach",  badge: spinReady ? "FREE" : null,             dark: false },
    { to: "Quests",     label: "Quests",      sub: claimable ? `${claimable} reward${claimable > 1 ? "s" : ""} ready` : `${quests.length} active`, icon: ListChecks,   gradient: "mint",   badge: claimable ? String(claimable) : null,  dark: false },
    { to: "Season",     label: "Season Pass", sub: `Tier ${seasonTier} · Galaxy season`,    icon: Trophy,      gradient: "lilac",  badge: null,                                   dark: false },
    { to: "Shop",       label: "Power Shop",  sub: `${ownedPowerups} owned`,                 icon: ShoppingBag, gradient: "butter", badge: null,                                   dark: true  },
  ];

  return (
    <View style={{ gap: 12 }}>
      {items.map(({ to, label, sub, icon: Icon, badge }, i) => (
        <MotiView
          key={to}
          from={{ opacity: 0, translateX: 10 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "spring", delay: 300 + 50 * i, damping: 20 }}
        >
          <MotiPressable onPress={() => navigation.navigate(to)}>
            <View
              className="flex-row items-center justify-between rounded-[32px] bg-[#1C1C24] p-6 border border-white/5"
            >
              <View>
                <Text className="text-[17px] font-bold tracking-tight text-white mb-1">
                  {label}
                </Text>
                <Text className="text-[13px] font-medium text-white/50">
                  {sub}
                </Text>
              </View>
              
              {badge ? (
                <View className="h-6 items-center justify-center rounded-full bg-[#FFB63B] px-3 shadow-sm">
                  <Text className="text-[10px] font-black tracking-wider text-ink uppercase">{badge}</Text>
                </View>
              ) : (
                <View className="opacity-40">
                  <Icon size={20} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              )}
            </View>
          </MotiPressable>
        </MotiView>
      ))}
    </View>
  );
}

const shadowSoft = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 3,
};
