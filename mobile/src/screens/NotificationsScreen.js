// Minimal stub matching Lovable design language
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Bell } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import Gradient from "../components/Gradient";

const NOTIFS = [
  { icon: "⚔️", title: "Tomi challenged you", time: "5 min", grad: "peach" },
  { icon: "🏆", title: "You climbed to #12 in Lagos", time: "1 hr", grad: "lilac" },
  { icon: "🎁", title: "Daily spin ready", time: "3 hr", grad: "mint" },
  { icon: "🔔", title: "Tournament starts in 2 hours", time: "5 hr", grad: "butter" },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  return (
    <AppShell>
      <PageTransition>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <Pressable onPress={() => navigation.navigate("Home")} className="size-10 items-center justify-center rounded-2xl bg-white border border-black/5" style={shadowSoft}>
              <ArrowLeft size={16} color="#1B1A2E" />
            </Pressable>
            <Text className="text-sm font-semibold text-muted-foreground">Notifications</Text>
            <View className="size-10" />
          </View>

          <View className="px-6 pb-4">
            <Text className="text-[1.9rem] font-semibold leading-tight text-ink" style={{ fontSize: 30 }}>Activity</Text>
          </View>

          <View className="px-6" style={{ gap: 10 }}>
            {NOTIFS.map((n, i) => (
              <MotiView key={i} from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: i * 60 }}>
                <View className="flex-row items-center gap-3 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
                  <Gradient name={n.grad} className="size-12 items-center justify-center rounded-2xl">
                    <Text style={{ fontSize: 22 }}>{n.icon}</Text>
                  </Gradient>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink">{n.title}</Text>
                    <Text className="text-xs text-muted-foreground">{n.time}</Text>
                  </View>
                </View>
              </MotiView>
            ))}
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
