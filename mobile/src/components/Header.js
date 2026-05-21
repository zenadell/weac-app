import React from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Bell, Coins, Gem, Search } from "lucide-react-native";
import { useGame } from "../lib/game-store";

export default function Header({ name, greeting = "Welcome back" }) {
  const navigation = useNavigation();
  const { level, xp, xpToNext, coins, gems, profile } = useGame();
  const displayName = name || profile?.name || "Ayo";
  const pct = Math.min(100, (xp / xpToNext) * 100);

  return (
    <MotiView
      from={{ opacity: 0, translateY: -8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 500 }}
      className="px-6 pt-14 pb-4"
    >
      {/* Sleek Minimalist Top Bar from Image 3 */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="size-11 rounded-full bg-[#1C1C24] items-center justify-center border border-white/5">
            <Text className="text-white font-black text-lg">{displayName.charAt(0)}</Text>
          </View>
          <View>
            <Text className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">{greeting}</Text>
            <Text className="text-[22px] font-black leading-none text-white mt-1" numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => navigation.navigate("Shop")} className="opacity-70">
            <Search size={22} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Notifications")} className="opacity-70 relative">
            <Bell size={22} color="#FFFFFF" strokeWidth={2.5} />
            <View className="absolute right-0 top-0 size-2.5 rounded-full bg-primary border-2 border-[#121214]" />
          </Pressable>
        </View>
      </View>

      {/* Modern Compact Level Bar */}
      <Pressable onPress={() => navigation.navigate("Season")} className="mt-6">
        <View className="flex-row items-center justify-between rounded-[24px] bg-[#1C1C24] p-4 border border-white/5">
          <View className="flex-row items-center gap-3">
            <View className="size-10 rounded-xl bg-purple items-center justify-center">
              <Text className="text-sm font-black text-white">{level}</Text>
            </View>
            <View>
              <Text className="text-[13px] font-bold text-white mb-1">Level {level}</Text>
              <View className="h-1.5 w-32 overflow-hidden rounded-full bg-[#121214]">
                <MotiView
                  from={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 900 }}
                  className="h-full rounded-full bg-primary"
                />
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <Coins size={14} color="#FFB63B" strokeWidth={2.6} />
              <Text className="text-[13px] font-bold text-white">{coins}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Gem size={14} color="#30C5A0" strokeWidth={2.6} />
              <Text className="text-[13px] font-bold text-white">{gems}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}
