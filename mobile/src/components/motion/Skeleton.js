import React from 'react';
import { MotiView } from 'moti';

export function Skeleton({ width, height, rounded = 'rounded-xl', className = '' }) {
  return (
    <MotiView
      from={{ opacity: 0.4 }}
      animate={{ opacity: 0.7 }}
      transition={{
        type: 'timing',
        duration: 700,
        loop: true,
      }}
      style={{ width, height }}
      className={`bg-black/5 dark:bg-white/10 ${rounded} ${className}`}
    />
  );
}
