// Web stub for react-native-webview
import React from 'react';
import { View } from 'react-native';

export function WebView({ style, source }) {
  if (source?.uri) {
    return (
      <iframe
        src={source.uri}
        style={{ width: '100%', height: '100%', border: 'none', ...style }}
        title="webview"
      />
    );
  }
  return <View style={style} />;
}
