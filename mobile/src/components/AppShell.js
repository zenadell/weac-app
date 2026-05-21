import React from "react";
import { View, StatusBar, Platform } from "react-native";
import BottomNav from "./BottomNav";
import { Confetti } from "./motion/Confetti";

export default function AppShell({ children, hideNav = false }) {
  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <View className="flex-1 pb-24">{children}</View>
      {!hideNav && <BottomNav />}
      <Confetti />
    </View>
  );
}
