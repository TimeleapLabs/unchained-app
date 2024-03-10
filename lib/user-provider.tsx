import "react-native-get-random-values";

import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect } from "react";

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
  const [privateKey, setPrivateKey] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [pin, setPin] = React.useState<string>("");

  useEffect(() => {
    const loadWallet = async () => {
      // await SecureStore.deleteItemAsync("wallet");
      // await SecureStore.deleteItemAsync("pin");
      setIsLoading(true);
      try {
        const wallet = await SecureStore.getItemAsync("wallet");
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
    const newPrivateKey = Math.random().toString(36).substring(7);
    SecureStore.setItem("wallet", newPrivateKey);
    SecureStore.setItem("pin", pin);
    setPrivateKey(newPrivateKey);
  };

  const loginUser = async (biometrics = false) => {
    const savedPin = await SecureStore.getItemAsync("pin");
    if (savedPin) {
      const isValidPin = savedPin === pin || biometrics;

      if (isValidPin) {
        setIsLoggedIn(true);
      }
    }

    throw new Error("Invalid PIN");
  };

  const deleteWallet = async () => {
    await SecureStore.deleteItemAsync("wallet");
    await SecureStore.deleteItemAsync("pin");
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
