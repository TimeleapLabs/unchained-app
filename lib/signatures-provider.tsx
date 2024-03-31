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
  brokerUrl: string | null;
  currentDocument: Correctness | null;
  signatures: Signature[];
  getSignature: (id: string) => Signature | undefined;
  setBrokerUrl: (url: string) => void;
  signCurrentDocument: () => Promise<void>;
  setDocumentForSigning: (document: Correctness | null) => void;
}

const SignaturesContext = createContext<SignaturesContext>({
  brokerUrl: null,
  currentDocument: null,
  signatures: [],
  getSignature: () => undefined,
  setBrokerUrl: () => {},
  setDocumentForSigning: () => {},
  signCurrentDocument: () => Promise.resolve(),
});

const GET_CORRECTNESS = gql`
  query CorrectnessReports($publicKey: String!) {
    correctnessReports(where: { hasSignersWith: { key: $publicKey } }) {
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
  const [brokerUrl, setBrokerUrl] = React.useState<string | null>(null);
  const { name, privateKey, publicKey } = useUser();
  const { data, refetch } = useQuery<CorrectnessReport>(GET_CORRECTNESS, {
    variables: {
      publicKey,
    },
  });

  useEffect(() => {
    if (data) {
      setSignatures(data.correctnessReports.edges.map((edge) => edge.node));
    }
  }, [data]);

  const setDocumentForSigning = (document: Correctness | null) => {
    setCurrentDocument(document);
  };

  const signCurrentDocument = async () => {
    if (currentDocument && privateKey && name && brokerUrl) {
      await startClient(currentDocument, privateKey, name, brokerUrl);
      await refetch();
    }
  };

  const getSignature = (id: string) => {
    return signatures.find((signature) => signature.id === id);
  };

  return (
    <SignaturesContext.Provider
      value={{
        brokerUrl,
        currentDocument,
        signatures,
        getSignature,
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
