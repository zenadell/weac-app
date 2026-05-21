// 1:1 port of src/components/Header.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { Bell, Coins, Gem } from "lucide-react-native";
import Gradient from "./Gradient";
import { useGame } from "../lib/game-store";
import { COLORS } from "../lib/utils";

export default function Header({ name, greeting = "Good morning" }) {
  const navigation = useNavigation();
  const { level, xp, xpToNext, coins, gems, profile } = useGame();
  const displayName = name || profile?.name || "Ayo Bakare";
  const pct = Math.min(100, (xp / xpToNext) * 100);

  return (
    <MotiView
      from={{ opacity: 0, translateY: -8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 500 }}
      className="px-6 pt-12 pb-6"
    >
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-sm font-medium text-muted-foreground">{greeting},</Text>
          <Text className="text-[2rem] font-semibold leading-none tracking-tight text-ink mt-1" numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.navigate("Shop")}
            className="flex-row items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 border border-black/5"
            style={shadowSoft}
          >
            <Coins size={14} color={COLORS.sand} strokeWidth={2.6} />
            <Text className="text-xs font-bold tabular-nums">{coins.toLocaleString()}</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Shop")}
            className="flex-row items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 border border-black/5"
            style={shadowSoft}
          >
            <Gem size={14} color={COLORS.royal} strokeWidth={2.6} />
            <Text className="text-xs font-bold tabular-nums">{gems}</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Notifications")}
            className="relative size-10 items-center justify-center rounded-full bg-white border border-black/5"
            style={shadowSoft}
          >
            <Bell size={16} color={COLORS.ink} strokeWidth={2.2} />
            <View className="absolute right-2 top-2 size-2 rounded-full bg-coral border-2 border-white" />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={() => navigation.navigate("Season")}
        className="mt-5"
      >
        <View
          className="flex-row items-center gap-3 rounded-2xl bg-white p-3 border border-black/5"
          style={shadowSoft}
        >
          <Gradient name="lilac" className="size-11 rounded-full items-center justify-center">
            <Text className="text-sm font-bold tabular-nums text-white">{level}</Text>
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: 1.4 }}
              transition={{ loop: true, type: "timing", duration: 1600 }}
              className="absolute -right-1 -top-1 size-2.5 rounded-full bg-butter border-2 border-white"
            />
          </Gradient>
          <View className="flex-1">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-xs font-semibold text-ink">Level {level}</Text>
              <Text className="text-[10px] tabular-nums text-muted-foreground">
                {xp}/{xpToNext} XP
              </Text>
            </View>
            <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
              <MotiView
                from={{ width: "0%" }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 900 }}
                className="h-full rounded-full"
              >
                <Gradient name="peach" className="h-full rounded-full" />
              </MotiView>
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const shadowSoft = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 3,
};
