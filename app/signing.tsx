import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, H2, Spinner, Text, View, XStack, YStack } from "tamagui";
import InlineField from "../components/InlineField";
import { useSignatures } from "../lib/signatures-provider";
import { Reject, RejectReasons, toHex } from "../lib/unchained-client";

export default function SigningScreen() {
  const [signed, setSigned] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentDocument, signCurrentDocument } = useSignatures();
  const router = useRouter();

  async function handleSign() {
    try {
      setError(null);
      setSigned(false);
      setSigning(true);
      await signCurrentDocument();
      setSigned(true);

      setTimeout(() => {
        router.replace("/");
      }, 3000);
    } catch (error) {
      const rejection = error as Reject;
      switch (rejection.reason) {
        case RejectReasons.Timeout:
          setError("Timeout");
          break;
        case RejectReasons.Error:
          setError(rejection.error?.message ?? "Unknown error");
          break;
        case RejectReasons.InvalidSignature:
          setError("Invalid signature");
          break;
        default:
          setError("Unknown error");
      }
    } finally {
      setSigning(false);
    }
  }

  function handleCancel() {
    router.replace("/");
  }

  if (currentDocument) {
    return (
      <View flex={1} justifyContent="center">
        <YStack paddingHorizontal="$4" width="100%" gap="$2">
          <H2 size="$3" marginBottom="$2" fontFamily="$subHeading">
            Do you want to sign this document?
          </H2>
          <InlineField label="Topic" text={toHex(currentDocument.topic)} />
          <InlineField label="Hash" text={toHex(currentDocument.hash)} />
          <InlineField
            label="Date"
            text={new Date(currentDocument.timestamp * 1000).toLocaleString()}
          />
          <InlineField
            label="Match"
            text={currentDocument.correct ? "Yes" : "No"}
          />
          <XStack gap="$4" width="100%" marginTop="$4">
            <Button
              variant="outlined"
              borderRadius="$10"
              size="$2"
              padding="$2"
              height="$4"
              flex={1}
              onPress={handleSign}
              disabled={signing}
            >
              {error ? "Retry" : "Sign"}
              {signing ? <Spinner /> : null}
            </Button>
            <Button
              variant="outlined"
              borderRadius="$10"
              size="$2"
              padding="$2"
              height="$4"
              flex={1}
              onPress={handleCancel}
              disabled={signing}
            >
              Cancel
            </Button>
          </XStack>
          <View height="$2" marginTop="$4" width="100%">
            {error && (
              <Text
                fontSize="$2"
                color="$red10"
                numberOfLines={3}
                textOverflow="initial"
              >
                Error: {error}
              </Text>
            )}
            {signed && (
              <Text fontSize="$2" color="$green10">
                Signed successfully
              </Text>
            )}
          </View>
        </YStack>
      </View>
    );
  }

  return null;
}
