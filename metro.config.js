const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

const { withTamagui } = require("@tamagui/metro-plugin");
module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
});
