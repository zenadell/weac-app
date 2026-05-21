import React from "react";
import { View, StatusBar } from "react-native";
import BottomNav from "./BottomNav";

// Wrap Confetti in a try-catch to prevent @shopify/react-native-skia crashes
let Confetti = () => null;
try {
  const confettiModule = require("./motion/Confetti");
  if (confettiModule?.Confetti) {
    Confetti = confettiModule.Confetti;
  }
} catch {
  // Skia not available – silently skip confetti
}

export default function AppShell({ children, hideNav = false }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#121214" }}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <View style={{ flex: 1, paddingBottom: hideNav ? 0 : 96 }}>{children}</View>
      {!hideNav && <BottomNav />}
      <Confetti />
    </View>
  );
}
