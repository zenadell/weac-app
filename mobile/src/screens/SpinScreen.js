// 1:1 port of src/routes/spin.tsx
import React, { useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import Svg, { Path, Circle, G } from "react-native-svg";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { useGame } from "../lib/game-store";
import { popBurst } from "../lib/confetti";

const rewards = [
  { label: "+50 XP",   kind: "xp",    amount: 50,  color: "#FF9E80" },
  { label: "+100",     kind: "coins", amount: 100, color: "#FFD54F" },
  { label: "+5 💎",    kind: "gems",  amount: 5,   color: "#9575CD" },
  { label: "+200 XP",  kind: "xp",    amount: 200, color: "#80CBC4" },
  { label: "+250",     kind: "coins", amount: 250, color: "#F06292" },
  { label: "+1 💎",    kind: "gems",  amount: 1,   color: "#CE93D8" },
  { label: "+500",     kind: "coins", amount: 500, color: "#4DB6AC" },
  { label: "JACKPOT",  kind: "gems",  amount: 25,  color: "#F06292" },
];

const slice = 360 / rewards.length;

export default function SpinScreen() {
  const navigation = useNavigation();
  const { spinAvailableAt, claimSpin } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const angleRef = useRef(0);
  const ready = Date.now() >= spinAvailableAt;

  async function doSpin() {
    if (spinning || !ready) return;
    setSpinning(true);
    setResult(null);
    const idx = Math.floor(Math.random() * rewards.length);
    const final = angleRef.current + 360 * 6 + (360 - idx * slice - slice / 2);
    angleRef.current = final % 360;
    setRotation(final);

    setTimeout(() => {
      const r = rewards[idx];
      setResult(r);
      claimSpin({ kind: r.kind, amount: r.amount });
      popBurst(0.5, 0.45);
      setSpinning(false);
    }, 4200);
  }

  return (
    <AppShell>
      <PageTransition>
        <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
          <Pressable
            onPress={() => navigation.navigate("Home")}
            className="size-10 items-center justify-center rounded-2xl bg-white border border-black/5"
            style={shadowSoft}
          >
            <ArrowLeft size={16} color="#1B1A2E" />
          </Pressable>
          <Text className="text-sm font-semibold text-muted-foreground">Daily spin</Text>
          <View className="size-10" />
        </View>

        <View className="px-6 pt-2 items-center">
          <Text className="text-[2rem] font-semibold leading-tight text-ink" style={{ fontSize: 32 }}>Spin to win</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {ready ? "One free spin every day" : "Next spin tomorrow"}
          </Text>
        </View>

        {/* Wheel */}
        <View className="relative items-center justify-center mt-8 self-center" style={{ width: 320, height: 320 }}>
          {/* Pointer */}
          <View className="absolute top-0 z-20" style={{ alignSelf: "center", marginTop: -4 }}>
            <Svg width={28} height={28}>
              <Path d="M14 28 L0 4 L28 4 Z" fill="#1B1A2E" />
            </Svg>
          </View>

          <MotiView
            from={{ rotate: "0deg" }}
            animate={{ rotate: `${rotation}deg` }}
            transition={{ type: "timing", duration: 4200, easing: Easing.out(Easing.cubic) }}
            className="rounded-full border-8 border-white"
            style={[{ width: 300, height: 300 }, shadowPop]}
          >
            <Svg width={300} height={300} viewBox="-150 -150 300 300">
              {rewards.map((r, i) => {
                const startAngle = (i * slice - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * slice - 90) * (Math.PI / 180);
                const x1 = 150 * Math.cos(startAngle);
                const y1 = 150 * Math.sin(startAngle);
                const x2 = 150 * Math.cos(endAngle);
                const y2 = 150 * Math.sin(endAngle);
                const path = `M0,0 L${x1},${y1} A150,150 0 0,1 ${x2},${y2} Z`;
                const midAngle = ((i + 0.5) * slice - 90) * (Math.PI / 180);
                const tx = 95 * Math.cos(midAngle);
                const ty = 95 * Math.sin(midAngle);
                return (
                  <G key={i}>
                    <Path d={path} fill={r.color} stroke="#fff" strokeWidth={1} />
                  </G>
                );
              })}
              <Circle cx={0} cy={0} r={42} fill="#fff" />
            </Svg>
            {/* Labels overlay */}
            {rewards.map((r, i) => {
              const midAngle = (i + 0.5) * slice;
              return (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left: 150,
                    top: 150,
                    transform: [
                      { translateX: -40 },
                      { translateY: -10 },
                      { rotate: `${midAngle}deg` },
                      { translateY: -90 },
                    ],
                  }}
                >
                  <Text className="text-xs font-bold text-white" style={{ width: 80, textAlign: "center" }}>{r.label}</Text>
                </View>
              );
            })}
          </MotiView>

          {/* Center icon */}
          <View
            className="absolute items-center justify-center rounded-full bg-white"
            style={[{ width: 84, height: 84 }, shadowPop]}
          >
            <Sparkles size={28} color="#F06292" />
          </View>
        </View>

        <View className="px-6 pt-8">
          <Pressable
            onPress={doSpin}
            disabled={spinning || !ready}
            style={{ opacity: spinning || !ready ? 0.5 : 1 }}
          >
            <Gradient name="peach" className="h-14 items-center justify-center rounded-full" style={shadowPop}>
              <Text className="text-base font-semibold text-white">
                {spinning ? "Spinning…" : ready ? "Spin now · Free" : "Come back tomorrow"}
              </Text>
            </Gradient>
          </Pressable>

          {result && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}
              className="mt-4 rounded-2xl bg-white p-4 items-center border border-black/5"
              style={shadowSoft}
            >
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">You won</Text>
              <Text className="mt-1 text-2xl font-bold text-ink">{result.label}</Text>
            </MotiView>
          )}
        </View>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
