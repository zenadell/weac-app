import React from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { MotiView, MotiImage } from "moti";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Play, BookOpen, Swords, FileText, Sparkles, ChevronRight } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { subjects } from "../lib/subjects";

const { width } = Dimensions.get("window");

export default function SubjectScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id || "biology";
  const subject = subjects[id] || subjects.biology;

  const color = {
    biology: "#30C5A0",
    chemistry: "#FA675E",
    physics: "#4C3297",
    maths: "#FFB63B",
    english: "#CE93D8",
  }[id] || "#30C5A0";

  return (
    <AppShell>
      <PageTransition>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          
          <View className="flex-row items-center justify-between px-6 pt-16 pb-4 z-20">
            <Pressable onPress={() => navigation.navigate("Home")} className="size-12 items-center justify-center rounded-full bg-[#1C1C24] border border-white/10 backdrop-blur-md">
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
            <View className="rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/5">
              <Text className="text-[11px] font-black uppercase tracking-widest text-white">Subject Mastery</Text>
            </View>
            <View className="size-12" />
          </View>

          {/* Epic Hero Section */}
          <View className="px-6 mb-8">
            <MotiView
              from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full rounded-[40px] p-8 border overflow-hidden relative"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Text 
                className="absolute -right-10 -bottom-10 text-[6rem] font-black text-black/10 uppercase tracking-tighter leading-none z-0"
                numberOfLines={1}
              >
                {subject.name}
              </Text>
              
              <View className="z-10 w-2/3">
                <Text className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">{subject.subtitle}</Text>
                <Text className="text-[3rem] font-black leading-none text-white tracking-tight mb-8">
                  {subject.name}
                </Text>
                
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl font-black tabular-nums text-white leading-none">{subject.mastery}%</Text>
                  <View className="flex-1 h-2 rounded-full bg-black/20 overflow-hidden">
                    <MotiView
                      from={{ width: "0%" }} animate={{ width: `${subject.mastery}%` }}
                      transition={{ delay: 300, duration: 1500, type: "spring", damping: 15 }}
                      className="h-full bg-white rounded-full"
                    />
                  </View>
                </View>
              </View>

              <MotiImage
                source={subject.image}
                from={{ translateY: 0, scale: 1 }}
                animate={{ translateY: -10, scale: 1.05 }}
                transition={{ loop: true, type: "timing", duration: 4000, direction: "alternate" }}
                className="absolute right-[-40px] top-[10%] z-10"
                style={{ width: 180, height: 180 }}
                resizeMode="contain"
                pointerEvents="none"
              />
            </MotiView>
          </View>

          {/* Quick Actions */}
          <View className="px-6 flex-row flex-wrap justify-between mb-8" style={{ gap: 12 }}>
            {[
              { icon: Play,     label: "Continue", to: "Tutor", color: "#30C5A0" },
              { icon: Swords,   label: "Arena",    to: "Duel",  color: "#FA675E" },
              { icon: FileText, label: "Papers",   to: "Predict", color: "#90CAF9" },
              { icon: Sparkles, label: "AI Tutor", to: "Tutor", color: "#CE93D8" },
            ].map(({ icon: Icon, label, to, color: iconColor }, i) => (
              <MotiView key={label} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 + i * 50 }} style={{ width: "47%" }}>
                <Pressable onPress={() => navigation.navigate(to)}>
                  <View className="h-32 rounded-[32px] p-5 bg-[#1C1C24] border border-white/5 justify-between">
                    <View className="size-12 rounded-[18px] items-center justify-center border border-white/10" style={{ backgroundColor: iconColor + "20" }}>
                      <Icon size={22} color={iconColor} strokeWidth={2} />
                    </View>
                    <Text className="text-[17px] font-black text-white">{label}</Text>
                  </View>
                </Pressable>
              </MotiView>
            ))}
          </View>

          {/* Topics Syllabus */}
          <View className="px-6">
            <View className="flex-row items-end justify-between mb-6">
              <Text className="text-[2rem] font-black tracking-tight text-white leading-none">Syllabus</Text>
              <Text className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase pb-1">{subject.topics.length} Chapters</Text>
            </View>

            <View style={{ gap: 12 }}>
              {subject.topics.map((t, i) => (
                <MotiView key={t.name} from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 200 + i * 50 }}>
                  <Pressable onPress={() => navigation.navigate("Tutor")}>
                    <View className="flex-row items-center gap-4 rounded-[28px] bg-[#1C1C24] p-4 border border-white/5">
                      <View className="size-14 items-center justify-center rounded-[20px] bg-[#2A2A35]">
                        <Text className="text-[15px] font-black text-white/50">{String(i + 1).padStart(2, "0")}</Text>
                      </View>
                      
                      <View className="flex-1 justify-center">
                        <View className="flex-row items-center justify-between mb-1.5">
                          <Text className="text-[16px] font-bold text-white w-3/4" numberOfLines={1}>{t.name}</Text>
                          <Text className="text-[11px] font-black text-muted-foreground uppercase">{t.minutes}m</Text>
                        </View>
                        <View className="h-1.5 w-full bg-[#121214] rounded-full overflow-hidden">
                          <MotiView
                            from={{ width: "0%" }} animate={{ width: `${t.progress}%` }}
                            transition={{ delay: 300 + i * 50, duration: 1000 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </View>
                      </View>
                      
                      <View className="size-8 items-center justify-center">
                        <ChevronRight size={18} color="#8E8E9F" />
                      </View>
                    </View>
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}
