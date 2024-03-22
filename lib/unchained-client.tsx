import { bls12_381 } from "@noble/curves/bls12-381";
import msgpack from "@ygoe/msgpack";
import { Buffer } from "buffer";
import * as crypto from "expo-crypto";
import { TextDecoder } from "text-encoding";

const config = {
  brokerUri: "wss://shinobi.brokers.kenshi.io",
  // brokerUri: "ws://192.168.1.59:4444",
  protocolVersion: "0.11.17",
};

interface Signer {
  Name: string;
  EvmWallet: string;
  PublicKey: Uint8Array;
  ShortPublicKey: Uint8Array;
}

interface Challenge {
  Passed: boolean;
  Random: Uint8Array;
  Signature: Uint8Array;
}

export interface Correctness {
  Timestamp: number;
  Hash: Uint8Array;
  Topic: Uint8Array;
  Correct: boolean;
}

interface CorrectnessReport {
  Correctness: Correctness;
  Signature: Uint8Array;
}

enum OpCodes {
  Hello = 0,
  KoskChallenge = 1,
  KoskResult = 2,
  Feedback = 4,
  Error = 5,
  CorrectnessReport = 10,
}

enum Feedbacks {
  KoskOk = "kosk.ok",
  ConfOk = "conf.ok",
  SignatureAccepted = "signature.accepted",
}

export enum RejectReasons {
  Timeout = "timeout",
  Error = "error",
}

export interface Reject {
  reason: RejectReasons;
  error?: Error;
}

const REPORT_TIMEOUT = 5000;
let client: WebSocket | null = null;

export const startClient = (
  rawDocument: Uint8Array,
  document: Correctness,
  privateKey: string
) =>
  new Promise<void>((resolve, reject) => {
    const brokerUrl = `${config.brokerUri}/${encodeURIComponent(
      config.protocolVersion
    )}`;
    let reportIntervalId: NodeJS.Timeout | null = null;
    client = new WebSocket(brokerUrl);
    client.binaryType = "arraybuffer";

    client.onopen = () => {
      console.log("WebSocket Client Connected");
      console.log("Sending Hello");
      const helloPayload = buildHelloPayload(privateKey);
      client?.send(new Uint8Array([OpCodes.Hello, ...helloPayload]));
    };

    client.onclose = () => {
      console.log("WebSocket Client Closed");
    };

    client.onerror = (error) => {
      reject({
        reason: RejectReasons.Error,
        error,
      });
    };

    client.onmessage = (e) => {
      const payload = new Uint8Array(e.data);
      const opcode = payload[0];
      const data = payload.slice(1);
      console.log("Received message", opcode);

      switch (opcode) {
        case OpCodes.Error: {
          const error = handleBrokerError(data);
          reject(new Error(error));
          break;
        }
        case OpCodes.Feedback: {
          const response = new TextDecoder().decode(data);
          console.log("Broker feedback:", response);

          switch (response) {
            case Feedbacks.KoskOk: {
              console.log("Kosk OK");
              const correctnessReport = buildCorrectnessReport(
                rawDocument,
                document,
                privateKey
              );

              console.log(
                "Sending Correctness Report",
                correctnessReport.length
              );
              client?.send(
                new Uint8Array([
                  OpCodes.CorrectnessReport,
                  ...correctnessReport,
                ])
              );

              // reportIntervalId = setTimeout(() => {
              //   client?.close();
              //   reject({
              //     reason: RejectReasons.Timeout,
              //   });
              // }, REPORT_TIMEOUT);
              break;
            }
            case Feedbacks.ConfOk:
              console.log("Confirmation OK", response);
              break;
            case Feedbacks.SignatureAccepted:
              console.log("Signature accepted", response);
              reportIntervalId && clearInterval(reportIntervalId);
              client?.close();
              resolve();
              break;
            default:
              console.error("Unknown broker feedback:", response);
          }

          break;
        }
        case OpCodes.KoskChallenge: {
          console.log("Received Kosk Challenge");
          const koskPayload = buildKoskPayload(data, privateKey);
          console.log("Sending Kosk Result", koskPayload.length);
          client?.send(new Uint8Array([OpCodes.KoskResult, ...koskPayload]));
          break;
        }
        default:
          reject(new Error("Unknown call code"));
      }
    };
  });

function buildCorrectnessReport(
  rawDocument: Uint8Array,
  document: Correctness,
  privateKey: string | null
) {
  if (!privateKey) {
    throw new Error("No signature to send");
  }
  const dst = { DST: "UNCHAINED" };
  console.log("Signing correctness", rawDocument.length, privateKey);
  const signature = bls12_381.signShortSignature(rawDocument, privateKey, dst);
  const correctness: CorrectnessReport = {
    Correctness: document,
    Signature: signature,
  };

  return msgpack.encode(correctness);
}

function buildHelloPayload(privateKey: string): Uint8Array {
  const publicKey = bls12_381.getPublicKeyForShortSignatures(privateKey);
  const shortPublicKey = bls12_381.getPublicKey(privateKey);

  const hello: Signer = {
    Name: "ClientName",
    EvmWallet: "0x...",
    PublicKey: publicKey,
    ShortPublicKey: shortPublicKey,
  };

  return msgpack.encode(hello);
}

function buildKoskPayload(data: Uint8Array, privateKey: string) {
  const challenge: Challenge = msgpack.decode(data) as Challenge;

  console.log("Received challenge");
  const dst = { DST: "UNCHAINED" };
  console.log("Signing challenge", privateKey);
  const signature = bls12_381.signShortSignature(
    challenge.Random,
    privateKey,
    dst
  );
  challenge.Signature = signature;
  return msgpack.encode(challenge);
}

function handleBrokerError(data: Uint8Array) {
  const error = new TextDecoder().decode(data);
  console.error("Broker error:", error);
  return error;
}

export function generateSecureRandom() {
  const targetValue = BigInt(
    "0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001"
  );
  let valid = false;
  let array;
  while (!valid) {
    array = new Uint8Array(32);
    crypto.getRandomValues(array);
    let hex = "0x";
    array.forEach((byte) => {
      hex += byte.toString(16).padStart(2, "0");
    });
    const num = BigInt(hex);
    if (num < targetValue) {
      valid = true;
    }
  }
  if (!array) {
    throw new Error("Failed to generate secure random");
  }
  return Buffer.from(array).toString("hex");
}

export function toHex(buffer: Uint8Array) {
  return Buffer.from(buffer).toString("hex");
}
