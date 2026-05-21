import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';

export function Toast({ visible, message, type = 'success', onDismiss }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  const bgColors = {
    success: 'bg-mint',
    error: 'bg-coral',
    info: 'bg-royal',
  };

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateY: 40, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: 40, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className={`absolute bottom-28 self-center px-6 py-3 rounded-full shadow-lg z-50 ${bgColors[type]}`}
        >
          <Text className="text-white font-semibold text-sm">{message}</Text>
        </MotiView>
      )}
    </AnimatePresence>
  );
}
