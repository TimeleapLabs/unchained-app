import { Link, Redirect } from "expo-router";
import { Button, Label, Text, View } from "tamagui";
import PinInput from "../../components/PinInput";
import { useUser } from "../../lib/user-provider";

export default function CreateWallet() {
  const { isWalletInitialized, setPin, pin } = useUser();

  if (isWalletInitialized) {
    return <Redirect href="/login" />;
  }

  return (
    <View padding="$4">
      <Text marginTop="$4" textAlign="center">
        {"First, let's define a PIN for your account."}
      </Text>

      <View marginTop="$4">
        <Label htmlFor="new-pin" size="$6" textAlign="center">
          Your PIN
        </Label>
        <PinInput value={pin} onChangeText={setPin} id="new-pin" autoFocus />
      </View>

      <Link href="/onboarding/confirm-pin" asChild>
        <Button
          marginTop="$4"
          disabled={pin.length < 6}
          backgroundColor="$red8"
          opacity={pin.length < 6 ? 0.5 : 1}
        >
          Continue
        </Button>
      </Link>
    </View>
  );
}
