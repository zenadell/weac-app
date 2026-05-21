import React from 'react';
import { View } from 'react-native';
import Rive from 'rive-react-native';

export function Avatar3D({ style }) {
  const asset = "";
  
  return (
    <View style={style}>
      <Rive
        url={asset}
        style={{ width: '100%', height: '100%' }}
        autoplay={true}
      />
    </View>
  );
}
