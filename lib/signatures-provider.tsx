import "react-native-get-random-values";

import React, { createContext, useContext, useEffect } from "react";
import { Correctness, startClient } from "./unchained-client";
import { useUser } from "./user-provider";

interface SignaturesProviderProps {
  children: React.ReactNode;
}

interface Signature {
  document: Correctness;
  timestamp: number;
}

interface SignaturesContext {
  signatures: Signature[];
  setDocumentForSigning: (
    document: Correctness | null,
    rawDocument: Uint8Array | null
  ) => void;
  currentDocument: Correctness | null;
  rawDocument: Uint8Array | null;
  signCurrentDocument: () => Promise<void>;
  getSignature: (timestamp: number) => Signature | undefined;
}

const SignaturesContext = createContext<SignaturesContext>({
  signatures: [],
  setDocumentForSigning: () => {},
  currentDocument: null,
  rawDocument: null,
  signCurrentDocument: () => Promise.resolve(),
  getSignature: () => undefined,
});

const SignaturesProvider = ({ children }: SignaturesProviderProps) => {
  const [signatures, setSignatures] = React.useState<Signature[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [currentDocument, setCurrentDocument] =
    React.useState<Correctness | null>(null);
  const [rawDocument, setRawDocument] = React.useState<Uint8Array | null>(null);
  const { isLoggedIn, privateKey } = useUser();

  useEffect(() => {
    const loadSignatures = async () => {
      setIsLoading(true);
      try {
        // somehow load signatures
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      loadSignatures();
    }
  }, [isLoggedIn]);

  const setDocumentForSigning = (
    document: Correctness | null,
    rawDocument: Uint8Array | null
  ) => {
    setCurrentDocument(document);
    setRawDocument(rawDocument);
  };

  const signCurrentDocument = async () => {
    console.log("Signing document", currentDocument, privateKey);
    if (rawDocument && currentDocument && privateKey) {
      await startClient(rawDocument, currentDocument, privateKey);
      const newSignature: Signature = {
        document: currentDocument,
        timestamp: Date.now(),
      };

      setSignatures([...signatures, newSignature]);
    }
  };

  const getSignature = (timestamp: number) => {
    return signatures.find((signature) => signature.timestamp === timestamp);
  };

  return (
    <SignaturesContext.Provider
      value={{
        signatures,
        setDocumentForSigning,
        currentDocument,
        rawDocument,
        signCurrentDocument,
        getSignature,
      }}
    >
      {children}
    </SignaturesContext.Provider>
  );
};

export const useSignatures = () => useContext(SignaturesContext);

export default SignaturesProvider;
