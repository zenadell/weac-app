import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

let hapticsEnabled = true;

export const initHaptics = async () => {
  try {
    const val = await AsyncStorage.getItem('settings.hapticsEnabled');
    if (val !== null) hapticsEnabled = val === 'true';
  } catch (e) {}
};

export const setHapticsEnabled = (enabled) => {
  hapticsEnabled = enabled;
  AsyncStorage.setItem('settings.hapticsEnabled', String(enabled));
};

export const lightImpact = () => {
  if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const mediumImpact = () => {
  if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const heavyImpact = () => {
  if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

export const successHaptic = () => {
  if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const errorHaptic = () => {
  if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export const warningHaptic = () => {
  if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};
