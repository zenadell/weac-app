// We inline what `nativewind/babel` does, but OMIT the `react-native-worklets/plugin`
// entry it hardcodes — that plugin only exists in Reanimated 4. We're on Reanimated 3.10.1
// (the Expo SDK 51 baseline), where worklets are bundled into reanimated itself.
//
// Equivalent to: presets: [..., "nativewind/babel"] minus the worklets requirement.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      require("react-native-css-interop/dist/babel-plugin").default,
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "automatic",
          importSource: "react-native-css-interop",
        },
      ],
      // Reanimated plugin must be listed LAST.
      "react-native-reanimated/plugin",
    ],
  };
};
