import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { useGame } from "../lib/game-store";

const STEPS = ["Who are you?", "Your school", "Your exam", "Your subjects", "Exam year"];
const EXAMS = ["WAEC", "JAMB", "NECO", "A-Levels", "SAT", "GCSE"];
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "Other"];
const ALL_SUBJECTS = [
  "English", "Mathematics", "Biology", "Chemistry", "Physics",
  "Economics", "Government", "Literature", "Geography",
];

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { setProfile } = useGame();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", country: "Nigeria", school: "", grade: "",
    examType: "", subjects: [], examYear: new Date().getFullYear() + 1,
  });

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 2;
    if (step === 1) return form.school.trim().length >= 2;
    if (step === 2) return !!form.examType;
    if (step === 3) return form.subjects.length >= 1;
    return true;
  };

  const next = () => {
    if (!canNext()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      setProfile({ ...form, onboarded: true });
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    }
  };
  const back = () => { if (step > 0) setStep(step - 1); };

  const toggleSubject = (s) => {
    setForm((f) => {
      if (f.subjects.includes(s)) return { ...f, subjects: f.subjects.filter((x) => x !== s) };
      if (f.subjects.length >= 9) return f;
      return { ...f, subjects: [...f.subjects, s] };
    });
  };

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);

  return (
    <AppShell hideNav>
      <PageTransition>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
            <Pressable
              onPress={back}
              disabled={step === 0}
              className="size-12 items-center justify-center rounded-full bg-[#1C1C24] border border-white/5"
              style={{ opacity: step === 0 ? 0.4 : 1 }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
            <View className="flex-row gap-2">
              {STEPS.map((_, i) => (
                <View key={i} className={`h-1.5 rounded-full ${i <= step ? "bg-primary w-6" : "bg-white/10 w-2"}`} />
              ))}
            </View>
            <View className="size-12" />
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
            <MotiView
              key={step}
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <Text className="text-[3rem] font-black tracking-tighter text-white mb-8 leading-none">
                {STEPS[step]}
              </Text>

              {step === 0 && (
                <View style={{ gap: 24 }}>
                  <Field label="WHAT'S YOUR NAME?" placeholder="e.g. Ayo" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} autoFocus />
                  <View>
                    <Text className="text-[11px] font-black tracking-widest text-muted-foreground uppercase mb-3">Country</Text>
                    <View className="flex-row flex-wrap gap-3">
                      {COUNTRIES.map((c) => (
                        <Pressable key={c} onPress={() => setForm((f) => ({ ...f, country: c }))}>
                          <View className={`rounded-full px-5 py-3 border ${form.country === c ? "bg-primary border-primary" : "bg-[#1C1C24] border-white/5"}`}>
                            <Text className={`text-[13px] font-bold ${form.country === c ? "text-[#121214]" : "text-white"}`}>{c}</Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {step === 1 && (
                <View style={{ gap: 24 }}>
                  <Field label="SCHOOL NAME" placeholder="e.g. Lagos Science Academy" value={form.school} onChangeText={(v) => setForm((f) => ({ ...f, school: v }))} autoFocus />
                  <Field label="CLASS / GRADE" placeholder="e.g. SS3 / Year 12" value={form.grade} onChangeText={(v) => setForm((f) => ({ ...f, grade: v }))} />
                </View>
              )}

              {step === 2 && (
                <View className="flex-row flex-wrap gap-4">
                  {EXAMS.map((e) => (
                    <Pressable key={e} onPress={() => setForm((f) => ({ ...f, examType: e }))} style={{ width: "47%" }}>
                      <View className={`rounded-[32px] p-6 items-center justify-center border ${form.examType === e ? "bg-purple border-purple" : "bg-[#1C1C24] border-white/5"}`} style={{ height: 120 }}>
                        <Text className="text-xl font-black text-white">{e}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {step === 3 && (
                <View>
                  <Text className="text-[13px] font-medium text-muted-foreground mb-6">{form.subjects.length}/9 selected</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {ALL_SUBJECTS.map((s) => {
                      const sel = form.subjects.includes(s);
                      return (
                        <Pressable key={s} onPress={() => toggleSubject(s)}>
                          <View className={`rounded-full px-5 py-3 border ${sel ? "bg-green border-green" : "bg-[#1C1C24] border-white/5"}`}>
                            <Text className={`text-[14px] font-bold ${sel ? "text-[#121214]" : "text-white"}`}>{s}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {step === 4 && (
                <View className="flex-row flex-wrap gap-4">
                  {years.map((y) => (
                    <Pressable key={y} onPress={() => setForm((f) => ({ ...f, examYear: y }))} style={{ width: "47%" }}>
                      <View className={`rounded-[32px] p-6 items-center justify-center border ${form.examYear === y ? "bg-yellow border-yellow" : "bg-[#1C1C24] border-white/5"}`} style={{ height: 100 }}>
                        <Text className={`text-2xl font-black ${form.examYear === y ? "text-[#121214]" : "text-white"}`}>{y}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </MotiView>
          </ScrollView>

          <View className="absolute bottom-10 left-6 right-6">
            <Pressable onPress={next} disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.4 }}>
              <View className="h-16 flex-row items-center justify-center gap-2 rounded-full bg-white shadow-xl">
                <Text className="text-lg font-black text-[#121214]">
                  {step === STEPS.length - 1 ? "Start Learning" : "Continue"}
                </Text>
                {step === STEPS.length - 1 && <Sparkles size={20} color="#121214" fill="#121214" />}
              </View>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </PageTransition>
    </AppShell>
  );
}

function Field({ label, placeholder, value, onChangeText, autoFocus }) {
  return (
    <View>
      <Text className="text-[11px] font-black tracking-widest text-muted-foreground uppercase mb-3">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#4A4A5A"
        autoFocus={autoFocus}
        autoCapitalize="words"
        className="rounded-[24px] bg-[#1C1C24] px-6 py-5 text-xl font-bold text-white border-2 border-transparent focus:border-primary"
      />
    </View>
  );
}
