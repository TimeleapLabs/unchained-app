import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "tamagui";
import { useUser } from "../lib/user-provider";

export default function HomeScreen() {
  const { isWalletInitialized, isLoggedIn } = useUser();

  if (!isWalletInitialized) {
    return <Redirect href="/onboarding/pin" />;
  }

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Home" }} />
      <SafeAreaView>
        <Text>Home</Text>
      </SafeAreaView>
    </>
  );
}
