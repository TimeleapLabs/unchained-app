import "react-native-get-random-values";

import { gql, useQuery } from "@apollo/client";
import React, { createContext, useContext, useEffect } from "react";
import { Correctness, startClient } from "./unchained-client";
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
  getSignature: (id: string) => Signature | undefined;
}

const SignaturesContext = createContext<SignaturesContext>({
  signatures: [],
  setDocumentForSigning: () => {},
  currentDocument: null,
  rawDocument: null,
  signCurrentDocument: () => Promise.resolve(),
  getSignature: () => undefined,
});

const GET_CORRECTNESS = gql`
  query CorrectnessReports {
    correctnessReports {
      edges {
        node {
          topic
          correct
          hash
          timestamp
          id
        }
      }
    }
  }
`;

interface Edge {
  node: {
    topic: string;
    hash: string;
    correct: boolean;
    timestamp: string;
    id: string;
  };
}

interface CorrectnessReport {
  correctnessReports: {
    edges: Edge[];
  };
}

const SignaturesProvider = ({ children }: SignaturesProviderProps) => {
  const [signatures, setSignatures] = React.useState<Signature[]>([]);
  const [currentDocument, setCurrentDocument] =
    React.useState<Correctness | null>(null);
  const [rawDocument, setRawDocument] = React.useState<Uint8Array | null>(null);
  const { isLoggedIn, privateKey } = useUser();
  const { loading, error, data, refetch } =
    useQuery<CorrectnessReport>(GET_CORRECTNESS);

  useEffect(() => {
    if (data) {
      setSignatures(data.correctnessReports.edges.map((edge) => edge.node));
    }
  }, [data]);

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
      await refetch();
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
