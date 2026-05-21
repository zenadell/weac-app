const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Map of native-only npm packages → local web-safe stubs
const WEB_STUBS = {
  'rive-react-native':        path.resolve(__dirname, 'src/stubs/rive-react-native.js'),
  'lottie-react-native':      path.resolve(__dirname, 'src/stubs/lottie-react-native.js'),
  'react-native-webview':     path.resolve(__dirname, 'src/stubs/react-native-webview.js'),
  '@shopify/react-native-skia': path.resolve(__dirname, 'src/stubs/react-native-skia.js'),
  'expo-haptics':             path.resolve(__dirname, 'src/stubs/expo-haptics.js'),
  'expo-av':                  path.resolve(__dirname, 'src/stubs/expo-av.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, redirect native-only packages to safe stubs
  if (platform === 'web') {
    // Fix AssetSourceResolver missing Platform
    if (moduleName === '../Utilities/Platform') {
      return {
        type: 'sourceFile',
        filePath: require.resolve('react-native-web/dist/exports/Platform'),
      };
    }
    // Redirect native-only packages
    const stub = WEB_STUBS[moduleName];
    if (stub) {
      return { type: 'sourceFile', filePath: stub };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
