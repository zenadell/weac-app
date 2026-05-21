// 1:1 port of src/components/LevelUpOverlay.tsx
import React, { useEffect } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import Gradient from "./Gradient";
import { useGame } from "../lib/game-store";

export default function LevelUpOverlay() {
  const { lastLevelUp, level, resetLevelUp } = useGame();

  useEffect(() => {
    if (lastLevelUp) {
      const t = setTimeout(resetLevelUp, 3500);
      return () => clearTimeout(t);
    }
  }, [lastLevelUp]);

  return (
    <Modal transparent visible={!!lastLevelUp} animationType="fade" onRequestClose={resetLevelUp}>
      <Pressable onPress={resetLevelUp} className="flex-1 items-center justify-center bg-ink/70 p-6">
        <MotiView
          from={{ scale: 0.5, rotate: "-10deg", opacity: 0 }}
          animate={{ scale: 1, rotate: "0deg", opacity: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 260 }}
          style={{ width: "100%", maxWidth: 320 }}
        >
          <Gradient
            name="peach"
            className="relative rounded-[36px] p-8 items-center"
            style={shadowPop}
          >
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: 1.15 }}
              transition={{ loop: true, type: "timing", duration: 1400 }}
              className="size-24 items-center justify-center rounded-full bg-white/25"
            >
              <Text className="text-5xl">⚡</Text>
            </MotiView>
            <Text className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-white/90">
              Level up
            </Text>
            <Text className="mt-1 text-5xl font-bold tabular-nums text-white">{level}</Text>
            <Text className="mt-2 text-sm text-white/90 text-center">
              You unlocked new mastery cards & shop items
            </Text>
          </Gradient>
        </MotiView>
      </Pressable>
    </Modal>
  );
}

const shadowPop = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.24,
  shadowRadius: 30,
  elevation: 10,
};
