import "react-native-get-random-values";

import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { generateSecureRandom } from "./unchained-client";

const PRIVATE_KEY_STORAGE_KEY = "pk";
const PIN_STORAGE_KEY = "pin";

interface WalletProviderProps {
  children: React.ReactNode;
}

interface UserContext {
  privateKey: string | null;
  publicKey: string | null;
  isWalletInitialized: boolean;
  isLoggedIn: boolean;
  initializeWallet: () => void;
  loginUser: (biometrics?: boolean) => Promise<void>;
  setPin: (pin: string) => void;
  pin: string;
  deleteWallet: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContext>({
  privateKey: null,
  publicKey: null,
  isWalletInitialized: false,
  isLoggedIn: false,
  initializeWallet: () => {},
  loginUser: () => Promise.resolve(),
  setPin: () => {},
  pin: "",
  deleteWallet: () => Promise.resolve(),
  isLoading: true,
});

const UserProvider = ({ children }: WalletProviderProps) => {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");

  useEffect(() => {
    const loadWallet = async () => {
      // await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
      // await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
      setIsLoading(true);
      try {
        const wallet = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
        if (wallet) {
          setPrivateKey(wallet);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadWallet();
  }, []);

  const initializeWallet = () => {
    const newPrivateKey = generateSecureRandom();
    SecureStore.setItem(PRIVATE_KEY_STORAGE_KEY, newPrivateKey);
    SecureStore.setItem(PIN_STORAGE_KEY, pin);
    setPrivateKey(newPrivateKey);
  };

  const loginUser = async (biometrics = false) => {
    const savedPin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    if (savedPin) {
      const isValidPin = savedPin === pin || biometrics;

      if (isValidPin) {
        setIsLoggedIn(true);
      }
    }

    throw new Error("Invalid PIN");
  };

  const deleteWallet = async () => {
    await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
    await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
    setPrivateKey(null);
    setIsLoggedIn(false);
    setPin("");
  };

  const isWalletInitialized = Boolean(privateKey) && !isLoading;

  return (
    <UserContext.Provider
      value={{
        privateKey,
        publicKey: null,
        isLoggedIn,
        isWalletInitialized,
        initializeWallet,
        loginUser,
        setPin,
        pin,
        deleteWallet,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserProvider;
