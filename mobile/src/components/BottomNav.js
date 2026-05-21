// 1:1 port of src/components/BottomNav.tsx
import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { MotiPressable } from "./primitives/MotiPressable";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Home, Swords, Sparkles, Layers, User } from "lucide-react-native";
import { COLORS } from "../lib/utils";

const items = [
  { to: "Home",    label: "Home",    icon: Home,     color: COLORS.peach },
  { to: "Duel",    label: "Duel",    icon: Swords,   color: COLORS.coral },
  { to: "Predict", label: "Predict", icon: Sparkles, color: COLORS.royal },
  { to: "Vault",   label: "Vault",   icon: Layers,   color: COLORS.teal },
  { to: "Profile", label: "Me",      icon: User,     color: COLORS.sand },
];

export default function BottomNav() {
  const navigation = useNavigation();
  const routeName = useNavigationState((s) => {
    if (!s) return "Home";
    const r = s.routes[s.index];
    return r?.name ?? "Home";
  });

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-6 left-0 right-0 z-50 flex-row justify-center px-4"
    >
      <View
        className="flex-row items-center gap-1 rounded-full border border-black/5 bg-white/95 p-2"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.18,
          shadowRadius: 30,
          elevation: 10,
        }}
      >
        {items.map(({ to, label, icon: Icon, color }) => {
          const active = routeName === to;
          return (
            <MotiPressable
              key={to}
              onPress={() => navigation.navigate(to)}
              className="relative"
              sound="swipe"
            >
              <MotiView
                from={{ scale: 1 }}
                animate={{ scale: 1 }}
                className="relative flex-row items-center gap-2 rounded-full px-3 py-2"
                style={{
                  backgroundColor: active
                    ? color + "30" // ~18% opacity
                    : "transparent",
                }}
              >
                <View className="relative size-9 items-center justify-center">
                  <Icon
                    size={20}
                    color={active ? color : COLORS.mutedForeground}
                    strokeWidth={2.4}
                  />
                </View>
                {active && (
                  <Text
                    className="text-sm font-semibold pr-2"
                    style={{ color }}
                  >
                    {label}
                  </Text>
                )}
              </MotiView>
            </MotiPressable>
          );
        })}
      </View>
    </View>
  );
}
