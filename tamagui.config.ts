import { config as baseConfig } from "@tamagui/config/v3";
import { createFont, createTamagui, createTokens } from "tamagui";

const poppinsSemiBoldFont = createFont({
  family: "PoppinsSemiBold",
  size: {
    1: 16,
    2: 20,
    3: 24,
    4: 28,
    5: 32,
    6: 40,
  },
});

const poppinsBoldFont = createFont({
  family: "PoppinsBold",
  size: {
    1: 16,
    2: 20,
    3: 24,
    4: 28,
    5: 32,
    6: 40,
  },
});

const rubikLightFont = createFont({
  family: "RubikLight",
  size: {
    1: 15,
    2: 16,
    3: 20,
    4: 30,
  },
});

const rubikRegularFont = createFont({
  family: "RubikRegular",
  size: {
    1: 15,
    2: 16,
    3: 20,
    4: 30,
  },
});

export const tokens = createTokens({
  ...baseConfig.tokens,
  color: {
    ...baseConfig.tokens.color,
    black: "rgba(0, 0, 0, 0.5)",
    white: "rgba(255, 255, 255)",
    textPrimary: "rgb(35, 35, 35)",
    textSecondary: "rgb(120, 132, 135)",
    buttonBg: "rgba(255, 255, 255, 0.95)",
    buttonText: "rgba(0, 0, 0, 0.85)",
    buttonBorder: "rgba(255, 255, 255, 0.12)",
  },
});

export const config = createTamagui({
  ...baseConfig,
  fonts: {
    heading: poppinsBoldFont,
    subHeading: poppinsSemiBoldFont,
    body: rubikRegularFont,
    bodySecondary: rubikLightFont,
  },
  tokens,
  themes: {
    dark: {
      ...baseConfig.themes.dark,
      accentColor: tokens.color.white,
    },
  },
});

export default config;

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
