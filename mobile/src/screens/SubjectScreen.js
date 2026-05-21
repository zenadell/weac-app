// 1:1 port of src/routes/subject.$id.tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView, MotiImage } from "moti";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Play, BookOpen, Swords, FileText, Sparkles } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { subjects } from "../lib/subjects";

export default function SubjectScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id || "biology";
  const subject = subjects[id] || subjects.biology;
  const textColor = subject.textDark ? "text-ink" : "text-white";
  const subText = subject.textDark ? "text-ink/70" : "text-white/85";

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <Pressable
              onPress={() => navigation.navigate("Home")}
              className="size-11 items-center justify-center rounded-2xl bg-white border border-black/5"
              style={shadowSoft}
            >
              <ArrowLeft size={20} color="#1B1A2E" strokeWidth={2.4} />
            </Pressable>
            <Text className="text-sm font-semibold text-muted-foreground">Subject</Text>
            <View className="size-11" />
          </View>

          {/* Hero */}
          <View className="mx-6">
            <Gradient name={subject.gradient} className="relative rounded-[36px] p-7 border border-black/5" style={shadowPop}>
              <View style={{ gap: 12 }}>
                <Text className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>
                  {subject.subtitle}
                </Text>
                <Text className={`text-[2.4rem] font-semibold leading-[1] ${textColor}`} style={{ fontSize: 38 }}>
                  {subject.name}
                </Text>
                <View className="flex-row items-center gap-3 pt-1">
                  <View className="h-2 flex-1 overflow-hidden rounded-full bg-white/25">
                    <MotiView
                      from={{ width: "0%" }} animate={{ width: `${subject.mastery}%` }}
                      transition={{ duration: 1200 }}
                      className={`h-full rounded-full ${subject.textDark ? "bg-ink" : "bg-white"}`}
                    />
                  </View>
                  <Text className={`text-sm font-bold tabular-nums ${textColor}`}>{subject.mastery}%</Text>
                </View>
              </View>
              <MotiImage
                source={subject.image}
                from={{ translateY: 0, rotate: "0deg" }}
                animate={{ translateY: -8, rotate: "6deg" }}
                transition={{ loop: true, type: "timing", duration: 5000 }}
                className="absolute -right-4 -bottom-6"
                style={{ width: 176, height: 176 }}
                resizeMode="contain"
                pointerEvents="none"
              />
            </Gradient>
          </View>

          {/* Action grid */}
          <View className="px-6 pt-6 flex-row flex-wrap" style={{ gap: 12 }}>
            {[
              { icon: Play,     label: "Continue lesson", to: "Tutor", g: "peach" },
              { icon: Swords,   label: "Quick duel",      to: "Duel",  g: "lilac" },
              { icon: FileText, label: "Past papers",     to: "Predict", g: "sky" },
              { icon: Sparkles, label: "AI tutor",        to: "Tutor", g: "mint" },
            ].map(({ icon: Icon, label, to, g }, i) => (
              <MotiView
                key={label}
                from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 100 + i * 60 }}
                style={{ width: "47%" }}
              >
                <Pressable onPress={() => navigation.navigate(to)}>
                  <Gradient name={g} className="h-24 rounded-3xl p-4 border border-black/5" style={shadowSoft}>
                    <View className="flex-1 justify-between">
                      <Icon size={20} color="#fff" strokeWidth={2.4} />
                      <Text className="text-sm font-semibold leading-tight text-white">{label}</Text>
                    </View>
                  </Gradient>
                </Pressable>
              </MotiView>
            ))}
          </View>

          {/* Topics */}
          <View className="px-6 pt-8">
            <View className="mb-3 flex-row items-center gap-2 px-1">
              <BookOpen size={16} color="#7B7995" />
              <Text className="text-sm font-semibold text-muted-foreground">Topics</Text>
            </View>
            <View style={{ gap: 12 }}>
              {subject.topics.map((t, i) => (
                <MotiView
                  key={t.name}
                  from={{ opacity: 0, translateX: -12 }} animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 150 + i * 50 }}
                >
                  <Pressable onPress={() => navigation.navigate("Tutor")}>
                    <View className="flex-row items-center gap-4 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
                      <View className="size-12 items-center justify-center rounded-xl bg-canvas">
                        <Text className="text-xs font-bold tabular-nums text-ink">{String(i + 1).padStart(2, "0")}</Text>
                      </View>
                      <View className="flex-1" style={{ gap: 6 }}>
                        <View className="flex-row items-baseline justify-between">
                          <Text className="text-sm font-semibold text-ink">{t.name}</Text>
                          <Text className="text-xs text-muted-foreground">{t.minutes} min</Text>
                        </View>
                        <View className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                          <MotiView
                            from={{ width: "0%" }} animate={{ width: `${t.progress}%` }}
                            transition={{ delay: 400 + i * 50, duration: 1000 }}
                            className="h-full rounded-full"
                          >
                            <Gradient name={subject.gradient} className="h-full rounded-full" />
                          </MotiView>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </View>

          <View className="px-6 pt-8">
            <Pressable
              onPress={() => navigation.navigate("Duel")}
              className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-ink"
              style={shadowPop}
            >
              <Swords size={20} color="#fff" />
              <Text className="text-base font-semibold text-white">Start a duel in {subject.name}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
