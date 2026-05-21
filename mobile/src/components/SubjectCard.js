import React from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView, MotiImage } from "moti";
import Svg, { Circle } from "react-native-svg";

export default function SubjectCard({
  title,
  subtitle,
  bgColor = "#4C3297",
  image,
  large,
  onPress,
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        className={`relative rounded-[32px] overflow-hidden p-5 flex-col items-center justify-center ${large ? "h-48" : "h-[190px]"}`}
        style={[
          { backgroundColor: bgColor },
          {
            shadowColor: bgColor,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }
        ]}
      >
        {/* Centered Floating 3D Image */}
        {image && (
          <View className="items-center justify-center pt-2">
            <MotiImage
              source={image}
              from={{ translateY: 0 }}
              animate={{ translateY: -10 }}
              transition={{ loop: true, type: "timing", duration: 2500, direction: "alternate" }}
              className="size-24 drop-shadow-xl"
              resizeMode="contain"
            />
          </View>
        )}

        {/* Text Area */}
        <View className="items-center mt-3">
          <Text className="text-[15px] font-bold tracking-wide text-white mb-0.5">{title}</Text>
        </View>
      </View>
    </Pressable>
  );
}
