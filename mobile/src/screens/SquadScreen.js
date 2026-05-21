// 1:1 port of src/routes/squad.tsx
import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Clipboard } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Users, UserPlus, Swords, Copy, Check } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";

const TEAM = [
  { name: "Ayo (you)", school: "Lagos Science", lvl: 7, color: "peach", ready: true },
  { name: "Tomi", school: "Lagos Science", lvl: 6, color: "mint", ready: true },
  { name: "Open slot", school: "—", lvl: 0, color: "butter", ready: false },
];

const RIVALS = [
  { name: "King's College", players: 412, win: "73%", grad: "rose" },
  { name: "Queens Academy", players: 280, win: "61%", grad: "lilac" },
  { name: "Federal Govt", players: 198, win: "58%", grad: "mint" },
  { name: "Loyola Jesuit", players: 156, win: "67%", grad: "peach" },
];

export default function SquadScreen() {
  const navigation = useNavigation();
  const [mode, setMode] = useState("3v3");
  const [copied, setCopied] = useState(false);
  const code = "BRN-92K4X";

  const copyCode = async () => {
    try { Clipboard.setString(code); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const slots = mode === "3v3" ? 3 : 5;
  const team = Array.from({ length: slots }, (_, i) => TEAM[i] ?? { name: "Open slot", school: "—", lvl: 0, color: "butter", ready: false });

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
            <Text className="text-sm font-semibold text-muted-foreground">Squad Battles</Text>
            <View className="size-11" />
          </View>

          {/* Mode switcher */}
          <View className="px-6 pb-5">
            <View className="relative flex-row gap-1 rounded-2xl bg-white p-1 border border-black/5" style={shadowSoft}>
              {["3v3", "5v5"].map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  className="flex-1 h-10 items-center justify-center rounded-xl overflow-hidden"
                >
                  {mode === m && (
                    <View className="absolute inset-0">
                      <Gradient name="peach" className="absolute inset-0 rounded-xl" />
                    </View>
                  )}
                  <Text className={`text-sm font-semibold ${mode === m ? "text-white" : "text-ink"}`}>{m}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Squad roster */}
          <View className="px-6 pb-6">
            <Text className="px-1 pb-3 text-base font-semibold text-ink">Your squad</Text>
            <View className="rounded-[28px] bg-white p-4 border border-black/5" style={shadowSoft}>
              <View style={{ gap: 12 }}>
                {team.map((p, i) => (
                  <MotiView
                    key={i}
                    from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 50 * i }}
                    className="flex-row items-center gap-3"
                  >
                    <Gradient name={p.color} className="size-12 items-center justify-center rounded-2xl border border-black/5">
                      {p.ready ? (
                        <Text className="text-sm font-bold text-white">{p.name[0]}</Text>
                      ) : (
                        <UserPlus size={20} color="#7B7995" />
                      )}
                    </Gradient>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-ink">{p.name}</Text>
                      <Text className="text-[11px] text-muted-foreground">{p.school}{p.lvl ? ` · Lv ${p.lvl}` : ""}</Text>
                    </View>
                    {p.ready ? (
                      <View className="rounded-full bg-mint/30 px-2 py-1">
                        <Text className="text-[10px] font-bold uppercase text-teal">Ready</Text>
                      </View>
                    ) : (
                      <Pressable className="rounded-full bg-canvas px-3 py-1">
                        <Text className="text-[11px] font-semibold text-ink">Invite</Text>
                      </Pressable>
                    )}
                  </MotiView>
                ))}
              </View>

              <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-canvas p-3">
                <Text className="flex-1 text-sm font-bold tracking-wider text-ink" style={{ fontFamily: "monospace" }}>{code}</Text>
                <Pressable onPress={copyCode} className="flex-row items-center gap-1 rounded-full bg-ink px-3 py-1.5">
                  {copied ? (
                    <>
                      <Check size={12} color="#fff" />
                      <Text className="text-[11px] font-semibold text-white">Copied</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={12} color="#fff" />
                      <Text className="text-[11px] font-semibold text-white">Copy code</Text>
                    </>
                  )}
                </Pressable>
              </View>
              <Text className="mt-2 px-1 text-[11px] text-muted-foreground">Share with friends to fill your squad</Text>
            </View>
          </View>

          {/* Find match */}
          <View className="px-6 pb-6">
            <Pressable onPress={() => navigation.navigate("Duel")}>
              <Gradient name="peach" className="relative flex-row items-center gap-3 rounded-[28px] p-5" style={shadowPop}>
                <View className="size-12 items-center justify-center rounded-2xl bg-white/25">
                  <Swords size={24} color="#fff" strokeWidth={2.4} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">Find rival squad</Text>
                  <Text className="text-xs text-white/85">~12s wait · shared XP pool</Text>
                </View>
                <Text className="text-2xl text-white">→</Text>
              </Gradient>
            </Pressable>
          </View>

          {/* Rival schools */}
          <View className="px-6 pb-10">
            <Text className="px-1 pb-3 text-base font-semibold text-ink">Challenge a rival school</Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {RIVALS.map((r, i) => (
                <MotiView
                  key={r.name}
                  from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 40 * i }}
                  style={{ width: "47%" }}
                >
                  <Pressable>
                    <Gradient name={r.grad} className="rounded-3xl p-4 border border-black/5" style={shadowSoft}>
                      <View className="size-9 items-center justify-center rounded-xl bg-white/25">
                        <Users size={16} color="#fff" strokeWidth={2.5} />
                      </View>
                      <Text className="mt-2 text-sm font-semibold leading-tight text-white">{r.name}</Text>
                      <Text className="text-[11px] text-white/85">{r.players} online · {r.win} win</Text>
                    </Gradient>
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </View>
        </ScrollView>

        <AnimatePresence>
          {copied && (
            <MotiView
              from={{ translateY: 60, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} exit={{ translateY: 60, opacity: 0 }}
              className="absolute bottom-24 left-4 right-4 rounded-2xl bg-ink/95 px-4 py-3 items-center"
              style={shadowPop}
            >
              <Text className="text-sm font-semibold text-white">Squad code copied — paste it in WhatsApp 🚀</Text>
            </MotiView>
          )}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
