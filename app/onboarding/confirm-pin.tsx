import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Button, H2, Text, YStack } from "tamagui";
import FormField from "../../components/FormField";
import PinInput from "../../components/PinInput";
import { useUser } from "../../lib/user-provider";

export default function ConfirmPin() {
  const { isWalletInitialized, pin, setPin, initializeWallet } = useUser();
  const [pinConfirm, setPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isPinSame = pin === pinConfirm;

  if (isWalletInitialized) {
    return <Redirect href="/login" />;
  }

  const isInvalid = pinConfirm.length < 6 || !isPinSame;

  const handleConfirm = () => {
    setLoading(true);
    try {
      initializeWallet();
      setPin("");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack padding="$4" gap="$8">
      <H2 size="$3" textAlign="center" marginBottom="$2">
        Confirm your PIN
      </H2>

      <FormField htmlFor="confirm-pin" label="Your PIN confirmation">
        <PinInput
          value={pinConfirm}
          onChangeText={setPinConfirm}
          id="confirm-pin"
          error={!isPinSame}
          autoFocus
          loading={loading}
        />
        {pinConfirm.length < 6 && (
          <Text color="$gray11" fontSize="$2" marginTop="$4">
            Your pin confirmation needs to be 6 characters long.
          </Text>
        )}
        {pinConfirm.length === 6 && !isPinSame && (
          <Text color="$red11" fontSize="$2" marginTop="$4">
            Your pin confirmation does not match.
          </Text>
        )}
      </FormField>

      {pinConfirm.length === 6 && isPinSame && (
        <Button
          marginTop="$4"
          disabled={isInvalid || loading}
          backgroundColor="$green8"
          opacity={isInvalid ? 0.5 : 1}
          onPress={handleConfirm}
        >
          Continue
        </Button>
      )}
    </YStack>
  );
}
