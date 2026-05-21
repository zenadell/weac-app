import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { MotiView } from 'moti';
import { lightImpact } from '../../lib/haptics';
import { play } from '../../lib/sounds';

export function MotiPressable({
  children,
  onPress,
  scaleTo = 0.96,
  style,
  className,
  haptic = true,
  sound = 'tap',
  ...props
}) {
  const [pressed, setPressed] = useState(false);

  const handlePressIn = (e) => {
    setPressed(true);
    props.onPressIn?.(e);
  };

  const handlePressOut = (e) => {
    setPressed(false);
    props.onPressOut?.(e);
  };

  const handlePress = (e) => {
    if (haptic) lightImpact();
    if (sound) play(sound);
    onPress?.(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...props}
    >
      <MotiView
        style={style}
        className={className}
        animate={{
          scale: pressed ? scaleTo : 1,
        }}
        transition={{
          type: 'spring',
          damping: 22,
          stiffness: 300,
        }}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
