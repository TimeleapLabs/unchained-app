import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Button, Label, Text, View } from "tamagui";
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
    <View padding="$4">
      <Text marginTop="$4" textAlign="center">
        {"Confirm you PIN."}
      </Text>

      <View marginTop="$4">
        <Label htmlFor="confirm-pin" size="$6" textAlign="center">
          Your PIN confirmation
        </Label>
        <PinInput
          value={pinConfirm}
          onChangeText={setPinConfirm}
          id="confirm-pin"
          error={!isPinSame}
          autoFocus
          loading={loading}
        />
      </View>

      <Button
        marginTop="$4"
        disabled={isInvalid || loading}
        backgroundColor="$red8"
        opacity={isInvalid ? 0.5 : 1}
        onPress={handleConfirm}
      >
        Continue
      </Button>
    </View>
  );
}
