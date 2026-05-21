import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { MotiPressable } from "./primitives/MotiPressable";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Home, Swords, Sparkles, Layers, User } from "lucide-react-native";

const items = [
  { to: "Home",    label: "Home",    icon: Home },
  { to: "Duel",    label: "Duel",    icon: Swords },
  { to: "Predict", label: "Predict", icon: Sparkles },
  { to: "Vault",   label: "Vault",   icon: Layers },
  { to: "Profile", label: "Me",      icon: User },
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
      className="absolute bottom-6 left-0 right-0 z-50 flex-row justify-center px-6"
    >
      <View
        className="flex-row items-center justify-between w-full rounded-[32px] bg-card/95 border border-white/5 px-6 py-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.4,
          shadowRadius: 30,
          elevation: 20,
        }}
      >
        {items.map(({ to, icon: Icon }) => {
          const active = routeName === to;
          return (
            <MotiPressable
              key={to}
              onPress={() => navigation.navigate(to)}
              className="items-center justify-center"
              sound="swipe"
            >
              <MotiView
                animate={{ scale: active ? 1.1 : 1, opacity: active ? 1 : 0.4 }}
                transition={{ type: "spring", damping: 15 }}
                className="relative items-center justify-center"
              >
                <Icon size={24} color="#FFFFFF" strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <MotiView 
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2.5 size-1 rounded-full bg-white"
                  />
                )}
              </MotiView>
            </MotiPressable>
          );
        })}
      </View>
    </View>
  );
}
