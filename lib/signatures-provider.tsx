import "react-native-get-random-values";

import React, { createContext, useContext, useEffect } from "react";
import { useUser } from "./user-provider";

interface SignaturesProviderProps {
  children: React.ReactNode;
}

export interface Document {
  metric: {
    document: string;
    timestamp: number;
  };
  value: {
    match: boolean;
  };
}

interface Signature {
  id: string;
  document: Document;
  signature: string;
  timestamp: number;
  match: boolean;
}

interface SignaturesContext {
  signatures: Signature[];
  setDocumentForSigning: (document: Document) => void;
  currentDocument: Document | null;
  signCurrentDocument: () => void;
  getSignature: (id: string) => Signature | undefined;
}

const SignaturesContext = createContext<SignaturesContext>({
  signatures: [],
  setDocumentForSigning: () => {},
  currentDocument: null,
  signCurrentDocument: () => {},
  getSignature: () => undefined,
});

const SignaturesProvider = ({ children }: SignaturesProviderProps) => {
  const [signatures, setSignatures] = React.useState<Signature[]>([
    {
      id: "1",
      document: {
        metric: {
          document: "Document 1",
          timestamp: Date.now(),
        },
        value: {
          match: true,
        },
      },
      signature: "signature1",
      timestamp: Date.now(),
      match: true,
    },
  ]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [currentDocument, setCurrentDocument] = React.useState<Document | null>(
    null
  );
  const { isLoggedIn } = useUser();

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

  const setDocumentForSigning = (document: Document) => {
    setCurrentDocument(document);
  };

  const signCurrentDocument = () => {
    if (currentDocument) {
      const newSignature: Signature = {
        id: Math.random().toString(36).substring(7),
        document: currentDocument,
        signature: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        match: currentDocument.value.match,
      };

      setSignatures([...signatures, newSignature]);
    }
  };

  const getSignature = (id: string) => {
    return signatures.find((signature) => signature.id === id);
  };

  return (
    <SignaturesContext.Provider
      value={{
        signatures,
        setDocumentForSigning,
        currentDocument,
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
