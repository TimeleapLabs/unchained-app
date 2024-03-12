import { Camera, CameraView } from "expo-camera/next";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Button, Text, View, XStack, YStack } from "tamagui";
import { Document, useSignatures } from "../lib/signatures-provider";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const { setDocumentForSigning } = useSignatures();
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setDocument(JSON.parse(data));
  };

  const handleSign = () => {
    if (document) {
      setDocumentForSigning(document);
      router.replace("/signing");
      setDocument(null);
    }
  };

  const handleCancel = () => {
    setDocument(null);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View
      flex={1}
      alignItems="center"
      height="100%"
      paddingHorizontal="$4"
      paddingTop="$4"
      borderRadius="$4"
      overflow="hidden"
      position="relative"
    >
      {document ? (
        <View width="100%" height={SCREEN_WIDTH} overflow="hidden"></View>
      ) : (
        <CameraView
          onBarcodeScanned={document ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "datamatrix"],
          }}
          style={{ width: "100%", height: SCREEN_WIDTH }}
        />
      )}
      <YStack paddingHorizontal="$4" paddingTop="$4" width="100%" gap="$2">
        {document ? (
          <YStack>
            <Text fontSize="$3" textAlign="center" marginBottom="$2">
              Do you want to sign this document?
            </Text>
            <Text fontSize="$2">Name: {document?.metric.document}</Text>
            <Text fontSize="$2">
              Date: {new Date(document?.metric.timestamp).toDateString()}
            </Text>
            <Text fontSize="$2">
              Match: {document?.value.match ? "Yes" : "No"}
            </Text>
            <XStack gap="$4" width="100%" flex={1} marginTop="$4">
              <Button
                variant="outlined"
                backgroundColor="$buttonBg"
                color="$buttonText"
                borderRadius="$10"
                size="$2"
                padding="$2"
                height="$4"
                flex={1}
                onPress={handleSign}
              >
                Sign
              </Button>
              <Button
                variant="outlined"
                borderRadius="$10"
                size="$2"
                padding="$2"
                height="$4"
                flex={1}
                onPress={handleCancel}
              >
                Cancel
              </Button>
            </XStack>
          </YStack>
        ) : (
          <Text fontSize="$3" textAlign="center">
            Scan the signature QR code
          </Text>
        )}
      </YStack>
    </View>
  );
}
