// import * as LocalAuthentication from "expo-local-authentication";
import * as LocalAuthentication from "expo-local-authentication";
import { Redirect, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-root-toast";
import { Button, Image, Label, ScrollView, Text, View } from "tamagui";
import PinInput from "../components/PinInput";
import { useUser } from "../lib/user-provider";

function getFirstName(name: string) {
  const firstName = name.split(" ")[0];
  return firstName;
}

export default function Password() {
  const [invalidPin, setInvalidPin] = useState(false);
  const {
    isWalletInitialized,
    isLoggedIn,
    isLoading,
    loginUser,
    pin,
    setPin,
    deleteWallet,
    name,
  } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const handlePinInput = (pin: string) => {
    setPin(pin);
  };

  useEffect(() => {
    async function validatePin() {
      if (pin.length === 6) {
        try {
          await loginUser();
        } catch (error) {
          setPin("");
          setInvalidPin(true);
        }
      } else if (pin.length > 0) {
        setInvalidPin(false);
      }
    }

    if (pathname === "/login") {
      validatePin();
    }
  }, [pin]);

  useEffect(() => {
    async function handleAuthentication() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate",
        });
        if (result.success) {
          await loginUser(true);
          router.replace("/");
        } else {
          Toast.show("Login failed.", {
            duration: Toast.durations.LONG,
          });
        }
      }
    }

    if (isWalletInitialized && !isLoggedIn) {
      handleAuthentication();
    }
  }, [isWalletInitialized, isLoggedIn]);

  if (!isWalletInitialized && !isLoading) {
    return <Redirect href="/onboarding/pin" />;
  }

  if (isLoggedIn) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView>
      <View padding="$4">
        <Image
          source={require("../assets/images/logo-full.png")}
          width="100%"
          height={100}
          resizeMode="contain"
          marginVertical="$10"
        />
        <Text textAlign="center">
          {name &&
            `Welcome back ${getFirstName(
              name
            )}! Please enter your PIN to continue.`}
        </Text>
        <View marginTop="$4">
          <Label htmlFor="login-pin" textAlign="center">
            Your PIN
          </Label>
          <PinInput
            value={pin}
            onChangeText={handlePinInput}
            error={invalidPin}
            id="login-pin"
            autoFocus
          />
        </View>
        {__DEV__ && (
          <View
            marginTop="$6"
            flexDirection="column"
            flex={1}
            gap="$4"
            marginHorizontal="$12"
          >
            <Button variant="outlined" onPress={deleteWallet}>
              Delete wallet
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
