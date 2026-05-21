import React from "react";
import { View, Text, Pressable, ScrollView, Alert, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, LogOut, Volume2, Vibrate, Globe, Shield } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import { useGame } from "../lib/game-store";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const game = useGame();
  const settings = game.profile?.settings || { sound: true, haptics: true, language: "English" };

  const updateSetting = (key, value) => {
    game.setProfile({ settings: { ...settings, [key]: value } });
  };

  const handleLogout = () => {
    Alert.alert("Sign out", "This will reset your local profile.", [
      { text: "Cancel" },
      {
        text: "Sign out", style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("brainduel.game.v1");
          navigation.reset({ index: 0, routes: [{ name: "Register" }] });
        },
      },
    ]);
  };

  return (
    <AppShell>
      <PageTransition>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
            <Pressable onPress={() => navigation.navigate("Profile")} className="size-10 items-center justify-center rounded-2xl bg-white border border-black/5" style={shadowSoft}>
              <ArrowLeft size={16} color="#1B1A2E" />
            </Pressable>
            <Text className="text-sm font-semibold text-muted-foreground">Settings</Text>
            <View className="size-10" />
          </View>

          <View className="px-6 pb-4">
            <Text className="text-[1.9rem] font-semibold leading-tight text-ink" style={{ fontSize: 30 }}>Preferences</Text>
          </View>

          <View className="px-6" style={{ gap: 8 }}>
            {/* Sound Effects */}
            <View className="flex-row items-center gap-4 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
              <View className="size-10 items-center justify-center rounded-xl bg-canvas">
                <Volume2 size={20} color="#1B1A2E" strokeWidth={2.2} />
              </View>
              <Text className="flex-1 text-sm font-semibold text-ink">Sound effects</Text>
              <Switch value={settings.sound} onValueChange={(v) => updateSetting("sound", v)} trackColor={{ true: "#FF9E80" }} />
            </View>

            {/* Haptics */}
            <View className="flex-row items-center gap-4 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
              <View className="size-10 items-center justify-center rounded-xl bg-canvas">
                <Vibrate size={20} color="#1B1A2E" strokeWidth={2.2} />
              </View>
              <Text className="flex-1 text-sm font-semibold text-ink">Haptic feedback</Text>
              <Switch value={settings.haptics} onValueChange={(v) => updateSetting("haptics", v)} trackColor={{ true: "#FF9E80" }} />
            </View>

            {/* Language */}
            <View className="flex-row items-center gap-4 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
              <View className="size-10 items-center justify-center rounded-xl bg-canvas">
                <Globe size={20} color="#1B1A2E" strokeWidth={2.2} />
              </View>
              <Text className="flex-1 text-sm font-semibold text-ink">Language</Text>
              <Text className="text-sm text-muted-foreground">{settings.language}</Text>
            </View>

            {/* Privacy */}
            <View className="flex-row items-center gap-4 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
              <View className="size-10 items-center justify-center rounded-xl bg-canvas">
                <Shield size={20} color="#1B1A2E" strokeWidth={2.2} />
              </View>
              <Text className="flex-1 text-sm font-semibold text-ink">Privacy & data</Text>
              <Text className="text-sm text-muted-foreground">{">"}</Text>
            </View>

            <Pressable onPress={handleLogout} className="mt-4 flex-row items-center gap-4 rounded-2xl bg-white p-4 border border-black/5" style={shadowSoft}>
              <View className="size-10 items-center justify-center rounded-xl bg-coral/10">
                <LogOut size={20} color="#F06292" strokeWidth={2.2} />
              </View>
              <Text className="flex-1 text-sm font-semibold text-coral">Sign out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </PageTransition>
    </AppShell>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
