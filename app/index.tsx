import { Link, Redirect, Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  H2,
  ListItem,
  ScrollView,
  Text,
  YStack,
  Image,
  XStack,
} from "tamagui";
import { useSignatures } from "../lib/signatures-provider";
import { useUser } from "../lib/user-provider";
import { ClipboardSignature } from "@tamagui/lucide-icons";
import { RefreshControl } from "react-native";
import { useCallback, useState } from "react";

export default function HomeScreen() {
  const { isWalletInitialized, isLoggedIn, isLoading, name } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const { bottom } = useSafeAreaInsets();
  const { signatures, refetchSignatures } = useSignatures();
  const router = useRouter();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchSignatures().then(() => setRefreshing(false));
  }, []);

  const handleItemPress = (topic: string) => {
    router.push(`/signature/${topic}`);
  };

  if (!isWalletInitialized && !isLoading) {
    return <Redirect href="/onboarding/pin" />;
  }

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Home" }} />
      <YStack fullscreen gap="$4" marginBottom={bottom} flex={1} marginTop="$4">
        <YStack paddingHorizontal="$4" gap="$6">
          <XStack gap="$2" marginTop="$4">
            <Image
              source={require("../assets/images/logo-full.png")}
              width="$4"
              height="$4"
              resizeMode="contain"
            />
            <Text fontSize="$4">Welcome back, {name}!</Text>
          </XStack>
          <Text fontSize="$2">
            You can sign new documents or view your recent signatures below.
          </Text>
          <Link href="/scan" asChild>
            <Button
              height="$6"
              variant="outlined"
              backgroundColor="$buttonBg"
              color="$buttonText"
              size="$3"
              padding="$2"
              borderRadius="$10"
            >
              New Signature
            </Button>
          </Link>
        </YStack>
        <H2 size="$2" marginHorizontal="$4" marginTop="$6">
          Recent Signatures
        </H2>
        <YStack flex={1} gap="$4">
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 0 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {signatures.length === 0 ? (
              <Text fontSize="$2" marginHorizontal="$4">
                No signatures yet
              </Text>
            ) : (
              signatures.map((signature) => (
                <ListItem
                  key={signature.hash}
                  onPress={() => {
                    handleItemPress(signature.id);
                  }}
                  title={`Document ${signature.hash.slice(0, 10)}`}
                  icon={<ClipboardSignature size={24} />}
                >
                  <Text fontSize="$1" color="$gray10">
                    {new Date(signature.timestamp).toLocaleString()}
                  </Text>
                  <Text fontSize="$1" color="$gray10">
                    Signed by: {signature.signerscount}
                    {signature.signerscount > 1 ? " people" : " person"}
                  </Text>
                </ListItem>
              ))
            )}
          </ScrollView>
        </YStack>
      </YStack>
    </>
  );
}
