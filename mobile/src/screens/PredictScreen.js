import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { MotiView } from "moti";
import { Sparkles, TrendingUp, AlertTriangle, Hexagon } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { API } from "../services/api";

const FALLBACK = [
  { name: "Chemistry", topic: "Organic Bonding", prob: 92, color: "#FA675E" },
  { name: "Biology", topic: "Cell Division", prob: 88, color: "#30C5A0" },
  { name: "Physics", topic: "Wave Motion", prob: 74, color: "#4C3297" },
  { name: "Maths", topic: "Calculus", prob: 65, color: "#FFB63B" },
  { name: "English", topic: "Comprehension", prob: 58, color: "#90CAF9" },
];

const SUBJECT_COLORS = {
  Chemistry: "#FA675E", Biology: "#30C5A0", Physics: "#4C3297", Mathematics: "#FFB63B", English: "#90CAF9",
};

export default function PredictScreen() {
  const [subjects, setSubjects] = useState(FALLBACK);

  useEffect(() => {
    (async () => {
      try {
        const list = ["Chemistry", "Biology", "Physics", "Mathematics", "English Language"];
        const results = await Promise.all(list.map((s) => API.predict(s, 2026, 1).catch(() => [])));
        const merged = results
          .map((preds, i) => {
            const top = preds?.[0];
            if (!top) return null;
            return {
              name: list[i] === "English Language" ? "English" : list[i] === "Mathematics" ? "Maths" : list[i],
              topic: top.topic,
              prob: Math.round((top.probability || 0) * 100),
              color: SUBJECT_COLORS[list[i]] || "#FA675E",
            };
          })
          .filter(Boolean);
        if (merged.length) setSubjects(merged);
      } catch {}
    })();
  }, []);

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} className="px-6 pt-16 pb-8">
            <View className="flex-row items-center gap-2 self-start rounded-full bg-purple/20 px-3 py-1.5 border border-purple/30 mb-4">
              <Sparkles size={14} color="#CE93D8" fill="#CE93D8" />
              <Text className="text-[10px] font-black uppercase tracking-widest text-[#CE93D8]">Neural Prophecy Engine</Text>
            </View>
            <Text className="text-[3rem] font-black leading-[1] tracking-tighter text-white">
              WAEC 2026{"\n"}Prediction
            </Text>
            <Text className="mt-3 text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Live Matrix Data • Updated Nightly
            </Text>
          </MotiView>

          {/* Matrix HUD Card */}
          <View className="px-6 mb-6">
            <MotiView
              from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 100, type: "spring", damping: 20 }}
              className="rounded-[32px] bg-[#1C1C24] p-6 border border-white/5 relative overflow-hidden"
              style={{ shadowColor: "#4C3297", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 }}
            >
              <View className="absolute -right-16 -top-16 opacity-5">
                <Hexagon size={200} color="#FFFFFF" strokeWidth={1} />
              </View>

              <View className="mb-8 flex-row items-center justify-between z-10">
                <Text className="text-xl font-black text-white">Topic Probability</Text>
                <View className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-white">May '26</Text>
                </View>
              </View>

              <View style={{ gap: 24 }} className="z-10">
                {subjects.map((s, i) => (
                  <MotiView key={s.name} from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 150 + i * 80 }}>
                    <View className="mb-2 flex-row items-end justify-between">
                      <View>
                        <Text className="text-[15px] font-black text-white leading-none mb-1">{s.name}</Text>
                        <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{s.topic}</Text>
                      </View>
                      <Text className="text-2xl font-black tabular-nums leading-none" style={{ color: s.color }}>{s.prob}%</Text>
                    </View>
                    <View className="h-2 w-full overflow-hidden rounded-full bg-[#121214]">
                      <MotiView
                        from={{ width: "0%" }} animate={{ width: `${s.prob}%` }}
                        transition={{ delay: 300 + i * 80, duration: 1500, type: "spring", damping: 15 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: s.color, shadowColor: s.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 }}
                      />
                    </View>
                  </MotiView>
                ))}
              </View>
            </MotiView>
          </View>

          {/* Intelligence Alerts */}
          <View className="px-6" style={{ gap: 16 }}>
            <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 500 }}>
              <View className="flex-row items-center gap-4 rounded-[28px] p-5 bg-[#FA675E]/10 border border-[#FA675E]/30 relative overflow-hidden">
                <View className="absolute inset-0 bg-black/20" />
                <View className="size-14 items-center justify-center rounded-[20px] bg-[#FA675E] z-10 shadow-lg" style={{ shadowColor: "#FA675E" }}>
                  <AlertTriangle size={24} color="#121214" strokeWidth={2.5} />
                </View>
                <View className="flex-1 z-10">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-[#FA675E] mb-1">Critical Intel</Text>
                  <Text className="text-[13px] font-bold leading-relaxed text-white">
                    Organic Chemistry classification jumped to 92% for Paper 2. Focus your last 2 weeks here.
                  </Text>
                </View>
              </View>
            </MotiView>

            <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 600 }}>
              <View className="flex-row items-center gap-4 rounded-[28px] p-5 bg-[#30C5A0]/10 border border-[#30C5A0]/30 relative overflow-hidden">
                <View className="absolute inset-0 bg-black/20" />
                <View className="size-14 items-center justify-center rounded-[20px] bg-[#30C5A0] z-10 shadow-lg" style={{ shadowColor: "#30C5A0" }}>
                  <TrendingUp size={24} color="#121214" strokeWidth={2.5} />
                </View>
                <View className="flex-1 z-10">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-[#30C5A0] mb-1">Pattern Locked</Text>
                  <Text className="text-[13px] font-bold leading-relaxed text-white">
                    Photosynthesis has appeared in 13 of last 15 papers. Bank the marks.
                  </Text>
                </View>
              </View>
            </MotiView>
          </View>
          
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}
