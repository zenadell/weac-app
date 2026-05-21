import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

export function NumberRoll({ value, className, style, duration = 600 }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === displayValue) return;
    
    let startTimestamp = null;
    const startValue = displayValue;
    const distance = value - startValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + distance * easeProgress));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }, [value]);

  return (
    <Text style={[styles.text, style]} className={`tabular-nums ${className}`}>
      {displayValue}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {}
});
