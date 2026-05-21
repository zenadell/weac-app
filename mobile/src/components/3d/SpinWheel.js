import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View } from 'react-native';
import Rive from 'rive-react-native';

export const SpinWheel = forwardRef(({ onStop, style }, ref) => {
  const riveRef = useRef(null);

  useImperativeHandle(ref, () => ({
    spin: (targetIndex) => {
      if (riveRef.current) {
        try {
          riveRef.current.fireState('WheelMachine', 'Spin');
        } catch (e) {
          console.warn('Rive state machine error (expected if dummy file)', e);
        }
        setTimeout(() => {
          onStop?.(targetIndex);
        }, 4200);
      }
    }
  }));

  // Note: Using require for local .riv files might need extra Metro config.
  // We use url with require or placeholder to avoid crash.
  const asset = "";

  return (
    <View style={style}>
      <Rive
        ref={riveRef}
        url={asset}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
});
