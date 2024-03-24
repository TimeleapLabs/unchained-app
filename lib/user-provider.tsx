import "react-native-get-random-values";

import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { generateSecureRandom, getPublicKey } from "./unchained-client";

const PRIVATE_KEY_STORAGE_KEY = "pk";
const PIN_STORAGE_KEY = "pin";
const NAME_STORAGE_KEY = "name";

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
  name: string;
  setName: (name: string) => void;
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
  name: "",
  setName: () => {},
});

const UserProvider = ({ children }: WalletProviderProps) => {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [name, setName] = useState<string>("");

  const loadWallet = async () => {
    setIsLoading(true);
    try {
      const storedName = await SecureStore.getItemAsync(NAME_STORAGE_KEY);
      const wallet = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
      if (storedName) {
        setName(storedName);
      }
      if (wallet) {
        setPrivateKey(wallet);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (privateKey) {
      setPublicKey(getPublicKey(privateKey));
    }
  }, [privateKey]);

  const initializeWallet = () => {
    const newPrivateKey = generateSecureRandom();
    SecureStore.setItem(PRIVATE_KEY_STORAGE_KEY, newPrivateKey);
    SecureStore.setItem(PIN_STORAGE_KEY, pin);
    SecureStore.setItem(NAME_STORAGE_KEY, name);
    setPrivateKey(newPrivateKey);
  };

  const loginUser = async (biometrics = false) => {
    if (biometrics) {
      setIsLoggedIn(true);
      return;
    }

    const savedPin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    if (savedPin) {
      const isValidPin = savedPin === pin;

      if (isValidPin) {
        setIsLoggedIn(true);
      }
    }

    throw new Error("Invalid PIN");
  };

  const deleteWallet = async () => {
    if (!__DEV__) {
      return;
    }
    await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
    await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
    setPrivateKey(null);
    setIsLoggedIn(false);
    setPin("");
  };

  const isWalletInitialized = Boolean(privateKey);

  return (
    <UserContext.Provider
      value={{
        privateKey,
        publicKey,
        isLoggedIn,
        isWalletInitialized,
        initializeWallet,
        loginUser,
        setPin,
        pin,
        deleteWallet,
        isLoading,
        name,
        setName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserProvider;
