import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "tamagui";
import { useSignatures } from "../lib/signatures-provider";

export default function SigningScreen() {
  const [signed, setSigned] = useState<boolean>(false);
  const { currentDocument, signCurrentDocument } = useSignatures();
  const router = useRouter();

  useEffect(() => {
    signCurrentDocument();
    setTimeout(() => {
      setSigned(true);

      setTimeout(() => {
        router.replace("/");
      }, 2000);
    }, 3000);
  }, []);

  return (
    <View flex={1} alignItems="center" justifyContent="center">
      <Text fontSize="$2">
        {signed
          ? `Document ${currentDocument?.metric.document} signed!`
          : "Signing document..."}
      </Text>
    </View>
  );
}
