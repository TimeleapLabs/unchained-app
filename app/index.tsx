import { Link, Redirect, Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, ListItem, ScrollView, Text, YStack } from "tamagui";
import { useSignatures } from "../lib/signatures-provider";
import { useUser } from "../lib/user-provider";

export default function HomeScreen() {
  const { isWalletInitialized, isLoggedIn, isLoading } = useUser();
  const { bottom } = useSafeAreaInsets();
  const { signatures } = useSignatures();
  const router = useRouter();

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
        <YStack paddingHorizontal="$4" gap="$4">
          <Text fontSize="$2">
            Click below to start a new signature session.
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
              New signature
            </Button>
          </Link>
        </YStack>
        <H2 size="$2" marginHorizontal="$4">
          Recent signatures
        </H2>
        <YStack flex={1} gap="$4">
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 0 }}
          >
            {signatures.length === 0 ? (
              <Text fontSize="$2" marginHorizontal="$4">
                No signatures yet
              </Text>
            ) : (
              signatures.map((signature) => (
                <ListItem
                  key={signature.topic}
                  onPress={() => {
                    handleItemPress(signature.id);
                  }}
                >
                  <Text fontSize="$2" numberOfLines={1} textOverflow="ellipsis">
                    {signature.hash}
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
