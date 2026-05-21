// 1:1 port of src/components/AppShell.tsx
import React from "react";
import { View, StatusBar } from "react-native";
import BottomNav from "./BottomNav";
import { Confetti } from "./motion/Confetti";

export default function AppShell({ children, hideNav = false }) {
  return (
    <View className="flex-1 bg-canvas dark:bg-canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#FBF8F0" />
      <View className="flex-1 pb-32">{children}</View>
      {!hideNav && <BottomNav />}
      <Confetti />
    </View>
  );
}
