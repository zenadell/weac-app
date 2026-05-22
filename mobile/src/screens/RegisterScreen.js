import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, TextInput, Dimensions, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Sparkles, Zap, Swords, Star, Shield, BookOpen, Calculator, Globe, Brain, Code, Target, Clock, Trophy } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation, withTiming, useAnimatedRef } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { useGame } from "../lib/game-store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STEPS = ["Identity", "Level", "Quest", "Subjects", "Commitment"];

const AVATAR_CLASSES = [
  { id: "speedster", label: "Speedster", icon: Zap, color: "#FA675E", desc: "Fast & Agile" },
  { id: "warrior", label: "Warrior", icon: Swords, color: "#30C5A0", desc: "Fierce & Bold" },
  { id: "mage", label: "Mage", icon: Star, color: "#FFB63B", desc: "Wise & Mystical" },
  { id: "guardian", label: "Guardian", icon: Shield, color: "#9F7AEA", desc: "Steadfast" },
];

const GRADE_LEVELS = [
  { id: "primary", label: "Elementary", sub: "Ages 5-10", icon: Star },
  { id: "middle", label: "Middle School", sub: "Ages 11-13", icon: Target },
  { id: "high", label: "High School", sub: "Ages 14-18", icon: Trophy },
  { id: "adult", label: "Adult / Pro", sub: "Ages 18+", icon: Brain },
];

const PATHWAYS = [
  { id: "stem", label: "STEM Explorer", sub: "Math & Sciences", color: "#30C5A0" },
  { id: "humanities", label: "Humanities Sage", sub: "Arts & History", color: "#FFB63B" },
  { id: "languages", label: "Language Master", sub: "Global Tongues", color: "#FA675E" },
  { id: "global", label: "Global Exams", sub: "SAT, GCSE, A-Levels", color: "#9F7AEA" },
];

const SUBJECTS = [
  { id: "math", label: "Mathematics", icon: Calculator },
  { id: "biology", label: "Biology", icon: Brain },
  { id: "physics", label: "Physics", icon: Zap },
  { id: "literature", label: "Literature", icon: BookOpen },
  { id: "english", label: "English", icon: Star },
  { id: "geography", label: "Geography", icon: Globe },
  { id: "coding", label: "Coding", icon: Code },
  { id: "history", label: "History", icon: Shield },
];

const COMMITMENTS = [
  { id: "casual", label: "Casual", min: "5 mins/day", xp: "+10 XP", color: "#A0AEC0" },
  { id: "regular", label: "Regular", min: "15 mins/day", xp: "+30 XP", color: "#30C5A0" },
  { id: "serious", label: "Serious", min: "30 mins/day", xp: "+60 XP", color: "#FFB63B" },
  { id: "insane", label: "Insane", min: "60 mins/day", xp: "+120 XP", color: "#FA675E" },
];

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { setProfile } = useGame();
  
  const scrollRef = useAnimatedRef();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [form, setForm] = useState({
    name: "",
    avatarClass: "",
    gradeLevel: "",
    pathway: "",
    subjects: [],
    commitment: "",
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollX.value = event.contentOffset.x; },
  });

  const canNext = () => {
    if (currentIndex === 0) return form.name.trim().length >= 2 && form.avatarClass;
    if (currentIndex === 1) return !!form.gradeLevel;
    if (currentIndex === 2) return !!form.pathway;
    if (currentIndex === 3) return form.subjects.length >= 1;
    if (currentIndex === 4) return !!form.commitment;
    return false;
  };

  const handleNext = () => {
    Keyboard.dismiss();
    if (!canNext()) return;
    
    if (currentIndex < STEPS.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      // Complete Registration
      setProfile({ ...form, onboarded: true });
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollRef.current?.scrollTo({ x: prevIndex * SCREEN_WIDTH, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  const toggleSubject = (s) => {
    setForm((f) => {
      if (f.subjects.includes(s)) return { ...f, subjects: f.subjects.filter((x) => x !== s) };
      if (f.subjects.length >= 4) return f; // Limit to 4 for focus
      return { ...f, subjects: [...f.subjects, s] };
    });
  };

  return (
    <AppShell hideNav>
      <PageTransition>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#09090B" }}>
          
          {/* Top Progress Bar */}
          <View className="flex-row items-center justify-between px-6 pt-16 pb-4 z-50">
            <Pressable
              onPress={handleBack}
              disabled={currentIndex === 0}
              className="size-12 items-center justify-center rounded-full bg-[#1C1C24] border border-white/5"
              style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
            <View className="flex-row gap-2">
              {STEPS.map((_, i) => (
                <View key={i} className={`h-1.5 rounded-full ${i <= currentIndex ? "bg-primary w-6" : "bg-white/10 w-2"}`} />
              ))}
            </View>
            <View className="size-12" />
          </View>

          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={false} // Prevent manual swipe, force button usage
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            bounces={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ width: SCREEN_WIDTH * STEPS.length }}
          >
            {/* Step 1: Identity */}
            <View style={{ width: SCREEN_WIDTH, padding: 24, paddingBottom: 120 }}>
              <Text className="text-[2.5rem] font-black tracking-tighter text-white mb-2 leading-none">Who are you?</Text>
              <Text className="text-base text-muted-foreground font-medium mb-10">Choose your Arena identity.</Text>
              
              <View style={{ gap: 24 }}>
                <View>
                  <Text className="text-[11px] font-black tracking-widest text-muted-foreground uppercase mb-3">Your Hero Name</Text>
                  <TextInput
                    value={form.name}
                    onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                    placeholder="e.g. ApexScholar"
                    placeholderTextColor="#4A4A5A"
                    autoCapitalize="words"
                    autoCorrect={false}
                    className="rounded-[24px] bg-[#1C1C24] px-6 py-5 text-xl font-bold text-white border-2 border-transparent focus:border-primary"
                  />
                </View>
                
                <View>
                  <Text className="text-[11px] font-black tracking-widest text-muted-foreground uppercase mb-3">Select Class</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {AVATAR_CLASSES.map((cls) => {
                      const Icon = cls.icon;
                      const active = form.avatarClass === cls.id;
                      return (
                        <Pressable key={cls.id} onPress={() => setForm((f) => ({ ...f, avatarClass: cls.id }))} style={{ width: "47%" }}>
                          <View className={`rounded-[24px] p-5 items-center justify-center border-2 ${active ? "bg-white border-white" : "bg-[#1C1C24] border-white/5"}`} style={{ height: 110 }}>
                            <View className={`size-12 rounded-full items-center justify-center mb-2`} style={{ backgroundColor: active ? cls.color + "20" : "#2A2A35" }}>
                              <Icon size={24} color={active ? cls.color : "#888"} />
                            </View>
                            <Text className={`text-sm font-bold ${active ? "text-black" : "text-white"}`}>{cls.label}</Text>
                          </View>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* Step 2: Level */}
            <View style={{ width: SCREEN_WIDTH, padding: 24, paddingBottom: 120 }}>
              <Text className="text-[2.5rem] font-black tracking-tighter text-white mb-2 leading-none">Your Level</Text>
              <Text className="text-base text-muted-foreground font-medium mb-10">We tailor the challenges to your stage.</Text>
              
              <View className="gap-4">
                {GRADE_LEVELS.map((grade) => {
                  const Icon = grade.icon;
                  const active = form.gradeLevel === grade.id;
                  return (
                    <Pressable key={grade.id} onPress={() => setForm((f) => ({ ...f, gradeLevel: grade.id }))}>
                      <View className={`flex-row items-center p-5 rounded-[24px] border-2 ${active ? "bg-purple/20 border-purple" : "bg-[#1C1C24] border-white/5"}`}>
                        <View className={`size-12 rounded-full items-center justify-center mr-4 ${active ? "bg-purple" : "bg-[#2A2A35]"}`}>
                          <Icon size={20} color={active ? "#FFF" : "#888"} />
                        </View>
                        <View>
                          <Text className="text-xl font-bold text-white mb-1">{grade.label}</Text>
                          <Text className={`text-sm font-medium ${active ? "text-purple-300" : "text-muted-foreground"}`}>{grade.sub}</Text>
                        </View>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {/* Step 3: Quest / Pathway */}
            <View style={{ width: SCREEN_WIDTH, padding: 24, paddingBottom: 120 }}>
              <Text className="text-[2.5rem] font-black tracking-tighter text-white mb-2 leading-none">Choose Quest</Text>
              <Text className="text-base text-muted-foreground font-medium mb-10">What is your primary focus?</Text>
              
              <View className="flex-row flex-wrap gap-4">
                {PATHWAYS.map((path) => {
                  const active = form.pathway === path.id;
                  return (
                    <Pressable key={path.id} onPress={() => setForm((f) => ({ ...f, pathway: path.id }))} style={{ width: "47%" }}>
                      <View className={`rounded-[32px] p-6 justify-between border-2 ${active ? "bg-white border-white" : "bg-[#1C1C24] border-white/5"}`} style={{ height: 160 }}>
                        <View className={`size-10 rounded-full mb-2`} style={{ backgroundColor: path.color }} />
                        <View>
                          <Text className={`text-lg font-black mb-1 ${active ? "text-black" : "text-white"}`}>{path.label}</Text>
                          <Text className={`text-[12px] font-bold ${active ? "text-gray-500" : "text-muted-foreground"}`}>{path.sub}</Text>
                        </View>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {/* Step 4: Subjects */}
            <View style={{ width: SCREEN_WIDTH, padding: 24, paddingBottom: 120 }}>
              <Text className="text-[2.5rem] font-black tracking-tighter text-white mb-2 leading-none">Your Subjects</Text>
              <Text className="text-base text-muted-foreground font-medium mb-10">Select up to 4 areas to master.</Text>
              
              <View>
                <Text className="text-[13px] font-medium text-muted-foreground mb-4">{form.subjects.length}/4 selected</Text>
                <View className="flex-row flex-wrap gap-3">
                  {SUBJECTS.map((s) => {
                    const active = form.subjects.includes(s.id);
                    const Icon = s.icon;
                    return (
                      <Pressable key={s.id} onPress={() => toggleSubject(s.id)}>
                        <View className={`flex-row items-center rounded-full px-5 py-3 border-2 ${active ? "bg-green border-green" : "bg-[#1C1C24] border-white/5"}`}>
                          <Icon size={16} color={active ? "#000" : "#888"} style={{ marginRight: 8 }} />
                          <Text className={`text-[15px] font-bold ${active ? "text-[#121214]" : "text-white"}`}>{s.label}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Step 5: Daily Commitment */}
            <View style={{ width: SCREEN_WIDTH, padding: 24, paddingBottom: 120 }}>
              <Text className="text-[2.5rem] font-black tracking-tighter text-white mb-2 leading-none">Daily Goal</Text>
              <Text className="text-base text-muted-foreground font-medium mb-10">How intense is your training?</Text>
              
              <View className="gap-4">
                {COMMITMENTS.map((c) => {
                  const active = form.commitment === c.id;
                  return (
                    <Pressable key={c.id} onPress={() => setForm((f) => ({ ...f, commitment: c.id }))}>
                      <View className={`flex-row items-center justify-between p-6 rounded-[24px] border-2 ${active ? "bg-white border-white" : "bg-[#1C1C24] border-white/5"}`}>
                        <View>
                          <Text className={`text-xl font-black mb-1 ${active ? "text-black" : "text-white"}`}>{c.label}</Text>
                          <Text className={`text-sm font-bold ${active ? "text-gray-500" : "text-muted-foreground"}`}>{c.min}</Text>
                        </View>
                        <View className={`px-4 py-2 rounded-full`} style={{ backgroundColor: active ? c.color + "30" : "#2A2A35" }}>
                          <Text className={`text-sm font-black`} style={{ color: active ? c.color : "#888" }}>{c.xp}</Text>
                        </View>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </View>

          </Animated.ScrollView>

          {/* Sticky Bottom Next Button */}
          <View className="absolute bottom-10 left-6 right-6">
            <Pressable onPress={handleNext} disabled={!canNext()}>
              <MotiView 
                animate={{ opacity: canNext() ? 1 : 0.4, scale: canNext() ? 1 : 0.98 }}
                transition={{ type: "spring", damping: 15 }}
                className="h-16 flex-row items-center justify-center gap-2 rounded-full bg-white shadow-xl"
              >
                <Text className="text-lg font-black text-[#121214]">
                  {currentIndex === STEPS.length - 1 ? "Start Learning" : "Continue"}
                </Text>
                {currentIndex === STEPS.length - 1 && <Sparkles size={20} color="#121214" fill="#121214" />}
              </MotiView>
            </Pressable>
          </View>
          
        </KeyboardAvoidingView>
      </PageTransition>
    </AppShell>
  );
}
