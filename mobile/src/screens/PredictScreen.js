// 1:1 port of src/routes/predict.tsx (wired to real Supabase predictions where possible)
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { MotiView } from "moti";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { API } from "../services/api";

const FALLBACK = [
  { name: "Chemistry", topic: "Organic Bonding", prob: 92, gradient: "peach" },
  { name: "Biology", topic: "Cell Division", prob: 88, gradient: "mint" },
  { name: "Physics", topic: "Wave Motion", prob: 74, gradient: "lilac" },
  { name: "Maths", topic: "Calculus", prob: 65, gradient: "sky" },
  { name: "English", topic: "Comprehension", prob: 58, gradient: "butter" },
];

const SUBJECT_GRADIENTS = {
  Chemistry: "peach", Biology: "mint", Physics: "lilac", Mathematics: "sky", English: "butter",
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
              gradient: SUBJECT_GRADIENTS[list[i]] || "peach",
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <MotiView
            from={{ opacity: 0, translateY: -8 }} animate={{ opacity: 1, translateY: 0 }}
            className="px-6 pt-12 pb-6"
          >
            <View className="flex-row items-center gap-2 self-start rounded-full bg-lilac/20 px-3 py-1">
              <Sparkles size={14} color="#9575CD" />
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-royal">AI Prophecy</Text>
            </View>
            <Text className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-tight text-ink" style={{ fontSize: 32 }}>
              What's coming in{"\n"}WAEC 2026
            </Text>
            <Text className="mt-2 text-sm text-muted-foreground">
              Trained on 15 years of exam data. Updated nightly.
            </Text>
          </MotiView>

          {/* Heatmap card */}
          <View className="px-6">
            <MotiView
              from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 }}
              className="rounded-[32px] bg-white p-6 border border-black/5"
              style={shadowSoft}
            >
              <View className="mb-5 flex-row items-center justify-between">
                <Text className="font-semibold text-ink">Topic probability</Text>
                <Text className="text-xs text-muted-foreground">May 2026</Text>
              </View>
              <View style={{ gap: 16 }}>
                {subjects.map((s, i) => (
                  <MotiView
                    key={s.name}
                    from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 150 + i * 80 }}
                  >
                    <View className="mb-1.5 flex-row items-baseline justify-between">
                      <View className="flex-row items-baseline">
                        <Text className="text-sm font-semibold text-ink">{s.name}</Text>
                        <Text className="ml-2 text-xs text-muted-foreground">· {s.topic}</Text>
                      </View>
                      <Text className="text-sm font-bold tabular-nums text-ink">{s.prob}%</Text>
                    </View>
                    <View className="h-3 w-full overflow-hidden rounded-full bg-canvas">
                      <MotiView
                        from={{ width: "0%" }} animate={{ width: `${s.prob}%` }}
                        transition={{ delay: 300 + i * 80, duration: 1000 }}
                        className="h-full rounded-full"
                      >
                        <Gradient name={s.gradient} className="h-full rounded-full" />
                      </MotiView>
                    </View>
                  </MotiView>
                ))}
              </View>
            </MotiView>
          </View>

          {/* Alerts */}
          <View className="px-6 pt-6" style={{ gap: 12 }}>
            <MotiView
              from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 500 }}
            >
              <Gradient name="peach" className="flex-row items-start gap-3 rounded-[28px] p-5" style={shadowSoft}>
                <View className="size-10 items-center justify-center rounded-xl bg-white/25">
                  <AlertCircle size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/90">High volatility</Text>
                  <Text className="mt-1 text-sm font-medium leading-snug text-white">
                    Organic Chemistry classification jumped to 92% for Paper 2. Focus your last 2 weeks here.
                  </Text>
                </View>
              </Gradient>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 600 }}
            >
              <Gradient name="mint" className="flex-row items-start gap-3 rounded-[28px] p-5" style={shadowSoft}>
                <View className="size-10 items-center justify-center rounded-xl bg-white/25">
                  <TrendingUp size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/90">Pattern locked in</Text>
                  <Text className="mt-1 text-sm font-medium leading-snug text-white">
                    Photosynthesis has appeared in 13 of last 15 papers. Bank the marks.
                  </Text>
                </View>
              </Gradient>
            </MotiView>
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
