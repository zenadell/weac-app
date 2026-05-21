// 1:1 port of src/components/RoastCard.tsx
import React from "react";
import { View, Text, Pressable, Share } from "react-native";
import { MotiView } from "moti";
import { Download, Share2, Sparkles } from "lucide-react-native";
import Gradient from "./Gradient";

const ROASTS = [
  "absolutely cooked",
  "left in the chat",
  "sent to detention",
  "ratio'd",
  "got their notes burned",
  "needs a tutor immediately",
  "study group revoked",
  "bookless behavior",
];

function pickRoast(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ROASTS[Math.abs(h) % ROASTS.length];
}

export default function RoastCard({ data, onShare }) {
  const blowout = data.winnerScore - data.loserScore;
  const roast = pickRoast(data.winnerName + data.loserName);
  const gap = blowout >= 5 ? "DEMOLISHED" : blowout >= 3 ? "OUTPLAYED" : "EDGED OUT";

  const handleShare = async () => {
    const text = `🧠 ${data.winnerName} ${gap.toLowerCase()} ${data.loserName} ${data.winnerScore}-${data.loserScore} in ${data.subject} on BrainDuel. ${data.loserName} ${roast} 💀`;
    try { await Share.share({ message: text, title: "BrainDuel Roast" }); } catch {}
    onShare?.();
  };

  return (
    <View style={{ gap: 16 }}>
      <MotiView
        from={{ opacity: 0, scale: 0.9, rotate: "-3deg" }}
        animate={{ opacity: 1, scale: 1, rotate: "0deg" }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        <Gradient
          name="peach"
          className="relative rounded-[32px] p-6 border border-black/10"
          style={shadowPop}
        >
          <MotiView
            from={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.3, opacity: 0.7 }}
            transition={{ loop: true, type: "timing", duration: 4000 }}
            className="absolute -right-10 -top-10 size-40 rounded-full bg-white/30"
          />

          <View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5 rounded-full bg-white/25 px-2.5 py-1">
                <Sparkles size={12} color="#fff" />
                <Text className="text-[10px] font-bold uppercase tracking-wider text-white">BrainDuel · {data.subject}</Text>
              </View>
              <View className="rounded-full bg-ink/30 px-2.5 py-1">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-white">{gap}</Text>
              </View>
            </View>

            <View className="mt-6 flex-row items-center gap-3">
              <View className="flex-1 items-center">
                <View className="size-14 rounded-2xl bg-white/30 border-2 border-white/50" />
                <Text className="mt-2 text-xs font-semibold text-white/90" numberOfLines={1}>{data.winnerName}</Text>
                <Text className="text-4xl font-bold tabular-nums text-white">{data.winnerScore}</Text>
              </View>

              <MotiView
                from={{ rotate: "-4deg" }}
                animate={{ rotate: "4deg" }}
                transition={{ loop: true, type: "timing", duration: 2000 }}
                className="size-10 items-center justify-center rounded-full bg-ink/40"
              >
                <Text className="text-xs font-bold text-white">VS</Text>
              </MotiView>

              <View className="flex-1 items-center opacity-80">
                <View className="size-14 rounded-2xl bg-white/15 border-2 border-white/25" />
                <Text className="mt-2 text-xs font-semibold text-white" numberOfLines={1}>{data.loserName}</Text>
                <Text className="text-4xl font-bold tabular-nums text-white">{data.loserScore}</Text>
              </View>
            </View>

            <View className="mt-5 rounded-2xl bg-ink/30 p-3 items-center">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/80">The verdict</Text>
              <Text className="mt-0.5 text-sm font-semibold text-white">
                {data.loserName} {roast} 💀
              </Text>
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/90">+{data.xpGained} XP</Text>
              {data.combo ? <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/90">{data.combo}× combo</Text> : null}
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/90">brainduel.app</Text>
            </View>
          </View>
        </Gradient>
      </MotiView>

      <View className="flex-row gap-3">
        <Pressable
          onPress={handleShare}
          className="flex-1 h-12 items-center justify-center flex-row gap-2 rounded-2xl bg-ink"
          style={shadowPop}
        >
          <Share2 size={16} color="#fff" />
          <Text className="text-sm font-semibold text-white">Share roast</Text>
        </Pressable>
        <Pressable
          onPress={handleShare}
          className="flex-1 h-12 items-center justify-center flex-row gap-2 rounded-2xl bg-white border border-black/5"
        >
          <Download size={16} color="#1B1A2E" />
          <Text className="text-sm font-semibold text-ink">Save card</Text>
        </Pressable>
      </View>
    </View>
  );
}

const shadowPop = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.18,
  shadowRadius: 30,
  elevation: 10,
};
