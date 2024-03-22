import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";
import SignaturesProvider from "../lib/signatures-provider";
import UserProvider from "../lib/user-provider";
import { config } from "../tamagui.config";
export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "login",
};

SplashScreen.preventAutoHideAsync();

const client = new ApolloClient({
  uri: "https://shinobi.brokers.kenshi.io/gql/query",
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  const [fontLoaded, fontError] = useFonts({
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    RubikRegular: require("../assets/fonts/Rubik-Regular.ttf"),
    RubikLight: require("../assets/fonts/Rubik-Light.ttf"),
  });

  useEffect(() => {
    if (fontLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, fontError]);

  if (!fontLoaded && !fontError) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={colorScheme as any}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <ApolloProvider client={client}>
            <UserProvider>
              <SignaturesProvider>
                <Stack>
                  <Stack.Screen
                    name="onboarding"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="scan" options={{ title: "New scan" }} />
                  <Stack.Screen
                    name="signing"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="signature"
                    options={{ title: "Signature", presentation: "modal" }}
                  />
                </Stack>
              </SignaturesProvider>
            </UserProvider>
          </ApolloProvider>
        </ThemeProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
