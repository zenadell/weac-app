// 1:1 port of src/routes/tutor.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Send, Sparkles } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";

const seed = [
  { id: 1, role: "ai", text: "Hey Ayo 👋 I'm Nova, your WAEC tutor. What should we crack today?" },
];

const suggestions = [
  "Explain photosynthesis like I'm 12",
  "Solve: 2x² + 5x − 3 = 0",
  "What's likely in Chemistry 2026?",
];

const responses = {
  default: "Great question. Let me break it down step by step — this is exactly the kind of pattern WAEC examiners love to test.",
  photosynthesis: "Picture a leaf as a tiny solar factory. Chlorophyll catches sunlight → splits water → grabs CO₂ from the air → builds glucose (food) and releases oxygen. Formula: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Light + water + air = food + the oxygen you're breathing right now.",
  solve: "Factor it: 2x² + 5x − 3 = (2x − 1)(x + 3) = 0. So x = ½ or x = −3. ✅",
  chemistry: "Based on 15 years of pattern data: Organic Bonding (92%), Electrochemistry (78%), Mole concept (74%). I'd spend 60% of your last 2 weeks on Organic.",
};

function reply(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("photo")) return responses.photosynthesis;
  if (p.includes("solve") || p.includes("=")) return responses.solve;
  if (p.includes("chem") || p.includes("predict")) return responses.chemistry;
  return responses.default;
}

export default function TutorScreen() {
  const navigation = useNavigation();
  const [msgs, setMsgs] = useState(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [msgs, typing]);

  const send = (text) => {
    if (!text.trim()) return;
    const myId = Date.now();
    setMsgs((m) => [...m, { id: myId, role: "me", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: myId + 1, role: "ai", text: reply(text) }]);
    }, 1100);
  };

  return (
    <AppShell hideNav>
      <PageTransition>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <Pressable
              onPress={() => navigation.navigate("Home")}
              className="size-11 items-center justify-center rounded-2xl bg-white border border-black/5"
              style={shadowSoft}
            >
              <ArrowLeft size={20} color="#1B1A2E" strokeWidth={2.4} />
            </Pressable>
            <View className="flex-row items-center gap-2">
              <MotiView
                from={{ scale: 1, rotate: "0deg" }}
                animate={{ scale: 1.08, rotate: "360deg" }}
                transition={{ loop: true, type: "timing", duration: 12000 }}
              >
                <Gradient name="lilac" className="size-9 rounded-full" style={shadowSoft} />
              </MotiView>
              <View>
                <Text className="text-sm font-semibold leading-none text-ink">Nova</Text>
                <Text className="text-[10px] text-muted-foreground">AI tutor · online</Text>
              </View>
            </View>
            <View className="size-11" />
          </View>

          <ScrollView
            ref={scrollRef}
            className="flex-1 px-6 pb-6"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            <View style={{ gap: 12 }}>
              <AnimatePresence>
                {msgs.map((m) => (
                  <MotiView
                    key={m.id}
                    from={{ opacity: 0, translateY: 10, scale: 0.96 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    className={`flex-row ${m.role === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <View
                      className={`max-w-[80%] rounded-3xl px-4 py-3 border border-black/5 ${
                        m.role === "me" ? "" : "bg-white"
                      }`}
                      style={[
                        shadowSoft,
                        m.role === "me" ? { overflow: "hidden" } : undefined,
                      ]}
                    >
                      {m.role === "me" && (
                        <View className="absolute inset-0">
                          <Gradient name="peach" className="absolute inset-0" />
                        </View>
                      )}
                      <Text className={`text-[0.95rem] leading-snug ${m.role === "me" ? "text-white" : "text-ink"}`} style={{ fontSize: 15 }}>
                        {m.text}
                      </Text>
                    </View>
                  </MotiView>
                ))}
                {typing && (
                  <MotiView
                    from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0 }}
                    className="flex-row justify-start"
                  >
                    <View className="flex-row items-center gap-1.5 rounded-3xl bg-white px-5 py-4 border border-black/5" style={shadowSoft}>
                      {[0, 1, 2].map((i) => (
                        <MotiView
                          key={i}
                          from={{ translateY: 0, opacity: 0.4 }}
                          animate={{ translateY: -5, opacity: 1 }}
                          transition={{ loop: true, type: "timing", duration: 900, delay: i * 150 }}
                          className="size-2 rounded-full bg-royal"
                        />
                      ))}
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
          </ScrollView>

          <View className="px-6 pb-8" style={{ gap: 12 }}>
            {msgs.length <= 1 && (
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => send(s)}
                    className="flex-row items-center gap-1.5 rounded-full bg-white px-3 py-2 border border-black/5"
                    style={shadowSoft}
                  >
                    <Sparkles size={12} color="#9575CD" />
                    <Text className="text-xs font-medium text-ink">{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View className="flex-row items-center gap-2 rounded-2xl bg-white p-2 border border-black/5" style={shadowPop}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask Nova anything…"
                placeholderTextColor="#7B7995"
                className="flex-1 px-3 text-sm text-ink"
                onSubmitEditing={() => send(input)}
                returnKeyType="send"
              />
              <Pressable
                onPress={() => send(input)}
                className="size-10 items-center justify-center rounded-xl bg-ink"
              >
                <Send size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
