// Quick onboarding registration — same design language as Lovable (light theme, gradient pop)
import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";
import { useGame } from "../lib/game-store";

const STEPS = ["Who are you?", "Your school", "Your exam", "Your subjects", "Exam year"];

const EXAMS = ["WAEC", "JAMB", "NECO", "A-Levels", "SAT", "GCSE", "Other"];

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Uganda", "Tanzania", "United Kingdom", "United States", "Canada", "India", "Other"];

const ALL_SUBJECTS = [
  "English Language", "Mathematics", "Biology", "Chemistry", "Physics",
  "Economics", "Government", "Literature", "Geography", "Commerce",
  "Accounting", "History", "Agriculture", "Computer Science",
  "French", "Yoruba", "Igbo", "Hausa", "Further Mathematics",
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
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <Pressable
              onPress={back}
              disabled={step === 0}
              className="size-10 items-center justify-center rounded-2xl bg-white border border-black/5"
              style={[shadowSoft, { opacity: step === 0 ? 0.4 : 1 }]}
            >
              <ArrowLeft size={16} color="#1B1A2E" />
            </Pressable>
            <Text className="text-sm font-semibold text-muted-foreground">{step + 1} of {STEPS.length}</Text>
            <View className="size-10" />
          </View>

          {/* Progress bar */}
          <View className="mx-6 h-1.5 overflow-hidden rounded-full bg-canvas">
            <MotiView
              from={{ width: "0%" }} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 400 }}
              className="h-full rounded-full"
            >
              <Gradient name="peach" className="h-full rounded-full" />
            </MotiView>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <Text className="text-[2rem] font-semibold tracking-tight text-ink mb-6" style={{ fontSize: 30 }}>
              {STEPS[step]}
            </Text>

            {step === 0 && (
              <View style={{ gap: 16 }}>
                <Field label="Your name" placeholder="e.g. Ayo Okonkwo" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} autoFocus />
                <Text className="text-sm font-semibold text-ink mt-2">Country</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {COUNTRIES.map((c) => (
                    <Pressable key={c} onPress={() => setForm((f) => ({ ...f, country: c }))}>
                      {form.country === c ? (
                        <Gradient name="lilac" className="rounded-full px-4 py-2">
                          <Text className="text-xs font-semibold text-white">{c}</Text>
                        </Gradient>
                      ) : (
                        <View className="rounded-full bg-white px-4 py-2 border border-black/5" style={shadowSoft}>
                          <Text className="text-xs font-semibold text-ink">{c}</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {step === 1 && (
              <View style={{ gap: 16 }}>
                <Field label="School name" placeholder="e.g. Lagos Science Academy" value={form.school} onChangeText={(v) => setForm((f) => ({ ...f, school: v }))} autoFocus />
                <Field label="Class / Grade" placeholder="e.g. SS3 / Year 12" value={form.grade} onChangeText={(v) => setForm((f) => ({ ...f, grade: v }))} />
              </View>
            )}

            {step === 2 && (
              <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                {EXAMS.map((e) => (
                  <Pressable key={e} onPress={() => setForm((f) => ({ ...f, examType: e }))} style={{ width: "47%" }}>
                    {form.examType === e ? (
                      <Gradient name="peach" className="rounded-2xl p-4 items-center justify-center" style={[shadowSoft, { minHeight: 64 }]}>
                        <Text className="text-base font-bold text-white">{e}</Text>
                      </Gradient>
                    ) : (
                      <View className="rounded-2xl bg-white p-4 items-center justify-center border border-black/5" style={[shadowSoft, { minHeight: 64 }]}>
                        <Text className="text-base font-bold text-ink">{e}</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            {step === 3 && (
              <View>
                <Text className="text-sm font-semibold text-ink mb-1">Pick up to 9 subjects</Text>
                <Text className="text-xs text-muted-foreground mb-3">{form.subjects.length} selected</Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {ALL_SUBJECTS.map((s) => {
                    const sel = form.subjects.includes(s);
                    return (
                      <Pressable key={s} onPress={() => toggleSubject(s)}>
                        {sel ? (
                          <Gradient name="mint" className="rounded-full px-4 py-2">
                            <Text className="text-xs font-semibold text-white">{s}</Text>
                          </Gradient>
                        ) : (
                          <View className="rounded-full bg-white px-4 py-2 border border-black/5" style={shadowSoft}>
                            <Text className="text-xs font-semibold text-ink">{s}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {step === 4 && (
              <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                {years.map((y) => (
                  <Pressable key={y} onPress={() => setForm((f) => ({ ...f, examYear: y }))} style={{ width: "31%" }}>
                    {form.examYear === y ? (
                      <Gradient name="peach" className="rounded-2xl p-5 items-center" style={shadowSoft}>
                        <Text className="text-lg font-bold text-white">{y}</Text>
                      </Gradient>
                    ) : (
                      <View className="rounded-2xl bg-white p-5 items-center border border-black/5" style={shadowSoft}>
                        <Text className="text-lg font-bold text-ink">{y}</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

          <View className="px-6 pb-10">
            <Pressable onPress={next} disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.5 }}>
              <View className="h-14 items-center justify-center rounded-full bg-[#FFB6C1]" style={shadowPop}>
                <Text className="text-base font-semibold text-white">
                  {step === STEPS.length - 1 ? "Let's go!" : "Continue"}
                </Text>
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
      <Text className="text-sm font-semibold text-ink mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7B7995"
        autoFocus={autoFocus}
        autoCapitalize="words"
        className="rounded-full bg-white px-5 py-4 text-base text-ink border-2 border-[#1E90FF]"
        style={shadowSoft}
      />
    </View>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
