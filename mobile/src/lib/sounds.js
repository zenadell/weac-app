import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sounds = {};
let soundsEnabled = true;

export async function preload() {
  try {
    const val = await AsyncStorage.getItem("settings.soundsEnabled");
    if (val !== null) soundsEnabled = val === "true";
  } catch (e) {}

  const map = {
    tap: require("../../assets/sounds/tap.mp3"),
    correct: require("../../assets/sounds/correct.mp3"),
    wrong: require("../../assets/sounds/wrong.mp3"),
    levelup: require("../../assets/sounds/levelup.mp3"),
    coin: require("../../assets/sounds/coin.mp3"),
    gem: require("../../assets/sounds/gem.mp3"),
    streak: require("../../assets/sounds/streak.mp3"),
    "match-found": require("../../assets/sounds/match-found.mp3"),
    "tick-clock": require("../../assets/sounds/tick-clock.mp3"),
    unlock: require("../../assets/sounds/unlock.mp3"),
    swipe: require("../../assets/sounds/swipe.mp3")
  };
  
  for (const [k, src] of Object.entries(map)) {
    try {
      const { sound } = await Audio.Sound.createAsync(src);
      sounds[k] = sound;
    } catch (e) {
      console.warn(`Failed to load sound ${k}`, e);
    }
  }
}

export function play(key) {
  if (soundsEnabled && sounds[key]) {
    sounds[key].replayAsync().catch(() => {});
  }
}

export const setSoundsEnabled = (enabled) => {
  soundsEnabled = enabled;
  AsyncStorage.setItem('settings.soundsEnabled', String(enabled));
};
