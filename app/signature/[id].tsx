import { useGlobalSearchParams } from "expo-router";
import { H2, Text, YStack } from "tamagui";
import InlineField from "../../components/InlineField";
import { useSignatures } from "../../lib/signatures-provider";

export default function SignatureScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { getSignature } = useSignatures();

  const signature = getSignature(id);

  if (signature) {
    return (
      <YStack gap="$2" marginTop="$4" paddingHorizontal="$4">
        <H2 size="$3">Details</H2>
        <YStack width="100%" gap="$2" marginTop="$4">
          <InlineField label="ID" text={signature?.id} />
          <InlineField label="Topic" text={signature.topic} />
          <InlineField label="Hash" text={signature.hash} />
          <InlineField
            label="Date"
            text={new Date(signature.timestamp).toLocaleString()}
          />
          <InlineField label="Match" text={signature.correct ? "Yes" : "No"} />
        </YStack>
      </YStack>
    );
  }

  return <Text>Signature not found</Text>;
}
