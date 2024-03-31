import { Camera, CameraView } from "expo-camera/next";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Text, View } from "tamagui";
import { useSignatures } from "../lib/signatures-provider";
import { Correctness, base64ToQrData } from "../lib/unchained-client";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { setDocumentForSigning, currentDocument, setBrokerUrl } =
    useSignatures();
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
    setDocumentForSigning(null);
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    const { url: Url, data: Data } = base64ToQrData(data);
    setDocumentForSigning(Data as Correctness);
    setBrokerUrl(Url);
    router.replace("/signing");
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
      <CameraView
        onBarcodeScanned={currentDocument ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "datamatrix"],
        }}
        style={{ width: "100%", height: SCREEN_WIDTH }}
      />
    </View>
  );
}
