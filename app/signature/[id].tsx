import { useGlobalSearchParams } from "expo-router";
import { H2, Text, YStack } from "tamagui";
import { useSignatures } from "../../lib/signatures-provider";

export default function SignatureScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { getSignature } = useSignatures();

  const signature = getSignature(Number(id));

  return (
    <YStack gap="$2" marginTop="$4" paddingHorizontal="$4">
      <H2 size="$2">Details</H2>
      <Text fontSize="$2">Signature: {signature?.timestamp}</Text>
      <Text fontSize="$2">Document: {signature?.document.Topic}</Text>
      <Text fontSize="$2">
        Match: {signature?.document.Correct ? "Yes" : "No"}
      </Text>
    </YStack>
  );
}
