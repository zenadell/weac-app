// Replaces Lovable's CSS `gradient-*` utilities since RN can't render CSS gradients on Views.
// Usage:
//   <Gradient name="peach" className="rounded-[36px] p-7">...</Gradient>
// Renders a LinearGradient as the background of any View.
import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENTS } from "../lib/utils";

export default function Gradient({ name = "peach", className = "", style, children, pointerEvents }) {
  const colors = GRADIENTS[name] || GRADIENTS.peach;
  return (
    <View className={`overflow-hidden ${className}`} style={style} pointerEvents={pointerEvents}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

// Pressable variant for buttons/links with gradient backgrounds
import { Pressable } from "react-native";
export function GradientPressable({ name = "peach", className = "", style, children, onPress, ...props }) {
  const colors = GRADIENTS[name] || GRADIENTS.peach;
  return (
    <Pressable onPress={onPress} className={`overflow-hidden ${className}`} style={style} {...props}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </Pressable>
  );
}
