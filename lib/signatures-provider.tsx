import "react-native-get-random-values";

import React, { createContext, useContext, useEffect } from "react";
import { Attestation, startClient } from "./unchained-client";
import { useUser } from "./user-provider";

interface SignaturesProviderProps {
  children: React.ReactNode;
}

interface Signature {
  topic: string;
  hash: string;
  correct: boolean;
  timestamp: string;
  id: string;
  signerscount: number;
}

interface SignaturesContext {
  brokerUrl: string | null;
  currentDocument: Attestation | null;
  signatures: Signature[];
  getSignature: (id: string) => Signature | undefined;
  setBrokerUrl: (url: string) => void;
  signCurrentDocument: () => Promise<void>;
  refetchSignatures: () => Promise<void>;
  setDocumentForSigning: (document: Attestation | null) => void;
}

const SignaturesContext = createContext<SignaturesContext>({
  brokerUrl: null,
  currentDocument: null,
  signatures: [],
  getSignature: () => undefined,
  setBrokerUrl: () => {},
  setDocumentForSigning: () => {},
  refetchSignatures: () => Promise.resolve(),
  signCurrentDocument: () => Promise.resolve(),
});

interface Data {
  consensus: boolean;
  hash: string;
  signature: string;
  signers_count: number;
  timestamp: number;
  topic: string;
  voted: number;
  meta: {
    correct: boolean;
  };
}

interface MongoAttestation {
  _id: string;
  hash: string;
  topic: string;
  data: Data;
  timestamp: string;
}

const EXPLORER_URL = "https://unchained.timeleap.swiss";
const SIGNATURES_URL = `${EXPLORER_URL}/api/unchained/user`;

const SignaturesProvider = ({ children }: SignaturesProviderProps) => {
  const [signatures, setSignatures] = React.useState<Signature[]>([]);
  const [currentDocument, setCurrentDocument] =
    React.useState<Attestation | null>(null);
  const [brokerUrl, setBrokerUrl] = React.useState<string | null>(null);
  const { name, privateKey, publicKey } = useUser();

  // use fetch to get the signatures
  const fetchSignatures = async () => {
    if (publicKey) {
      const response = await fetch(`${SIGNATURES_URL}/${publicKey}`);
      const data = (await response.json()) as MongoAttestation[];

      setSignatures(
        data.map((attestation) => ({
          topic: attestation.topic,
          hash: attestation.hash,
          correct: attestation.data.meta.correct,
          timestamp: attestation.timestamp,
          id: attestation._id,
          signerscount: attestation.data.signers_count,
        })),
      );
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, [publicKey]);

  const setDocumentForSigning = (document: Attestation | null) => {
    setCurrentDocument(document);
  };

  const signCurrentDocument = async () => {
    if (currentDocument && privateKey && name && brokerUrl) {
      await startClient(currentDocument, privateKey, name, brokerUrl);
      // await refetch();
    }
  };

  const getSignature = (id: string) => {
    return signatures.find((signature: Signature) => signature.id === id);
  };

  const refetchSignatures = async () => {
    await fetchSignatures();
  };

  return (
    <SignaturesContext.Provider
      value={{
        brokerUrl,
        currentDocument,
        signatures,
        getSignature,
        refetchSignatures,
        setBrokerUrl,
        setDocumentForSigning,
        signCurrentDocument,
      }}
    >
      {children}
    </SignaturesContext.Provider>
  );
};

export const useSignatures = () => useContext(SignaturesContext);

export default SignaturesProvider;
