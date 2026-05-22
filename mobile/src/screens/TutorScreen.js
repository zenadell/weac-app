// 1:1 port of src/routes/tutor.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Send, Sparkles } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { GenerativeArtScene } from "../components/ui/anomalous-matter-hero";
import { LinearGradient } from "expo-linear-gradient";

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
        
        {/* Generative 3D AI Brain Background */}
        <GenerativeArtScene style={StyleSheet.absoluteFillObject} />

        {/* Subtle Dark Gradient Overlay for text readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4 z-10">
            <Pressable
              onPress={() => navigation.navigate("Home")}
              className="size-11 items-center justify-center rounded-2xl bg-white/10 border border-white/20"
              style={shadowSoft}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
            <View className="flex-row items-center gap-3">
              <View>
                <Text className="text-base font-bold text-white text-right">Nova AI</Text>
                <Text className="text-[11px] text-sky-300 font-semibold uppercase tracking-wider text-right">Online</Text>
              </View>
            </View>
            <View className="size-11" />
          </View>

          {/* Chat List */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-6 pb-6 z-10"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            <View style={{ gap: 16 }}>
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
                      className={`max-w-[85%] rounded-3xl px-5 py-4 border ${
                        m.role === "me" 
                          ? "bg-sky-500/20 border-sky-400/30" 
                          : "bg-white/10 border-white/10"
                      }`}
                      style={[
                        shadowSoft,
                      ]}
                    >
                      <Text className="text-[0.95rem] leading-relaxed text-white font-medium" style={{ fontSize: 15 }}>
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
                    <View className="flex-row items-center gap-2 rounded-3xl bg-white/10 px-5 py-4 border border-white/10" style={shadowSoft}>
                      {[0, 1, 2].map((i) => (
                        <MotiView
                          key={i}
                          from={{ translateY: 0, opacity: 0.4 }}
                          animate={{ translateY: -5, opacity: 1 }}
                          transition={{ loop: true, type: "timing", duration: 900, delay: i * 150 }}
                          className="size-2 rounded-full bg-sky-300"
                        />
                      ))}
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
          </ScrollView>

          {/* Input Area */}
          <View className="px-6 pb-8 z-10" style={{ gap: 16 }}>
            {msgs.length <= 1 && (
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => send(s)}
                    className="flex-row items-center gap-1.5 rounded-full bg-black/40 px-4 py-3 border border-white/15"
                    style={shadowSoft}
                  >
                    <Sparkles size={14} color="#7dd3fc" />
                    <Text className="text-[13px] font-semibold text-white">{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View className="flex-row items-center gap-2 rounded-3xl bg-black/50 p-2 border border-white/20" style={shadowPop}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask Nova anything…"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="flex-1 px-4 text-[15px] font-medium text-white h-12"
                onSubmitEditing={() => send(input)}
                returnKeyType="send"
              />
              <Pressable
                onPress={() => send(input)}
                className="size-12 items-center justify-center rounded-full bg-sky-500"
              >
                <Send size={18} color="#fff" style={{ marginLeft: 2 }} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 10 };
