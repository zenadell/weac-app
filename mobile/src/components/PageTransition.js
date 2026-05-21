// 1:1 port of src/components/PageTransition.tsx
import React from "react";
import { MotiView } from "moti";

export default function PageTransition({ children }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -8 }}
      transition={{ duration: 450, type: "timing" }}
      style={{ flex: 1 }}
    >
      {children}
    </MotiView>
  );
}
