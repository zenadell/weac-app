// 1:1 port of src/components/SubjectCard.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView, MotiImage } from "moti";
import Svg, { Circle } from "react-native-svg";
import Gradient from "./Gradient";

export default function SubjectCard({
  title,
  subtitle,
  gradient,
  bgColor,
  percent,
  image,
  large,
  textDark,
  children,
  onPress,
}) {
  const text = textDark ? "text-ink" : "text-white";
  const subText = textDark ? "text-ink/70" : "text-white/80";

  const CardWrapper = bgColor ? View : Gradient;
  const wrapperProps = bgColor ? { style: [{ backgroundColor: bgColor }, shadowSoft] } : { name: gradient, style: shadowSoft };

  return (
    <Pressable onPress={onPress}>
      <CardWrapper
        {...wrapperProps}
        className={`relative rounded-[36px] overflow-hidden p-5 border border-white/10 ${large ? "h-48" : "h-52"}`}
      >
        {/* Top Right Percentage Pill */}
        {percent !== undefined && (
          <View className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1 flex-row items-center gap-1 backdrop-blur-md">
             <Text className={`text-[11px] font-extrabold ${text}`}>{percent}%</Text>
          </View>
        )}
        
        {/* Centered Image */}
        {image && (
          <View className="flex-1 items-center justify-center pt-2">
            <MotiImage
              source={image}
              from={{ translateY: 0 }}
              animate={{ translateY: -8 }}
              transition={{ loop: true, type: "timing", duration: 3000, direction: "alternate" }}
              className="size-24"
              resizeMode="contain"
            />
          </View>
        )}

        {/* Bottom Content */}
        <View className="items-center mt-3 pb-1">
          <Text className={`text-[1.1rem] font-black tracking-tight ${text}`}>{title}</Text>
          {subtitle && <Text className={`text-[11px] font-bold mt-0.5 opacity-80 ${text}`}>{subtitle}</Text>}
        </View>

        {children && <View className="absolute left-0 right-0 bottom-0 h-1">{children}</View>}
      </CardWrapper>
    </Pressable>
  );
}

const shadowSoft = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 3,
};
