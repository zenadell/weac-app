import "./global.css";
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { GameProvider, useGame } from "./src/lib/game-store";
import LevelUpOverlay from "./src/components/LevelUpOverlay";

// Screens (all 1:1 ports from Lovable repo)
import HomeScreen from "./src/screens/HomeScreen";
import DuelScreen from "./src/screens/DuelScreen";
import PredictScreen from "./src/screens/PredictScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import QuestsScreen from "./src/screens/QuestsScreen";
import ShopScreen from "./src/screens/ShopScreen";
import SpinScreen from "./src/screens/SpinScreen";
import SeasonScreen from "./src/screens/SeasonScreen";
import TournamentScreen from "./src/screens/TournamentScreen";
import SquadScreen from "./src/screens/SquadScreen";
import TutorScreen from "./src/screens/TutorScreen";
import VaultScreen from "./src/screens/VaultScreen";
import SubjectScreen from "./src/screens/SubjectScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

import OnboardingScreen from "./src/screens/OnboardingScreen";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { profile, hydrated } = useGame();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    if (hydrated) {
      setInitialRoute("Onboarding");
    }
  }, [hydrated]);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Duel" component={DuelScreen} />
      <Stack.Screen name="Predict" component={PredictScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Quests" component={QuestsScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Spin" component={SpinScreen} />
      <Stack.Screen name="Season" component={SeasonScreen} />
      <Stack.Screen name="Tournament" component={TournamentScreen} />
      <Stack.Screen name="Squad" component={SquadScreen} />
      <Stack.Screen name="Tutor" component={TutorScreen} />
      <Stack.Screen name="Vault" component={VaultScreen} />
      <Stack.Screen name="Subject" component={SubjectScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GameProvider>
          <NavigationContainer>
            <RootNavigator />
            <LevelUpOverlay />
          </NavigationContainer>
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
