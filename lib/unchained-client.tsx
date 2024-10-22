import { bls12_381 } from "@noble/curves/bls12-381";
import base64 from "base64-js";
import { Buffer } from "buffer";
import * as crypto from "expo-crypto";
import { Sia } from "sializer";
import { TextDecoder } from "text-encoding";

interface Signer {
  name: string;
  evmWallet: string;
  publicKey: Uint8Array;
  shortPublicKey: Uint8Array;
}

interface Challenge {
  passed: boolean;
  random: Uint8Array;
  signature: Uint8Array;
}

export interface Attestation {
  timestamp: number;
  hash: Uint8Array;
  topic: Uint8Array;
  correct: boolean;
}

export interface QrData {
  data: Attestation;
  url: string;
}

interface AttestationReport {
  attestation: Attestation;
  signature: Uint8Array;
}

enum OpCodes {
  Hello = 0,
  KoskChallenge = 1,
  KoskResult = 2,
  Feedback = 4,
  Error = 5,
  Attestation = 6,
}

enum Feedbacks {
  KoskOk = "kosk.ok",
  ConfOk = "conf.ok",
  SignatureAccepted = "signature.accepted",
  SignatureInvalid = "signature.invalid",
}

export enum RejectReasons {
  Timeout = "timeout",
  Error = "error",
  InvalidSignature = "invalid_signature",
}

export interface Reject {
  reason: RejectReasons;
  error?: Error;
}

const REPORT_TIMEOUT = 30000;
let client: WebSocket | null = null;

export const startClient = (
  document: Attestation,
  privateKey: string,
  name: string,
  brokerUrl: string,
) =>
  new Promise<void>((resolve, reject) => {
    let reportIntervalId: NodeJS.Timeout | null = null;
    client = new WebSocket(brokerUrl);
    client.binaryType = "arraybuffer";

    client.onopen = () => {
      console.log("Sending hello");
      const helloPayload = buildHelloPayload(privateKey, name);
      client?.send(new Uint8Array([OpCodes.Hello, ...helloPayload]));
    };

    client.onclose = () => {
      console.info("WebSocket Client Closed");
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

      switch (opcode) {
        case OpCodes.Error: {
          const error = handleBrokerError(data);
          reject(new Error(error));
          break;
        }
        case OpCodes.Feedback: {
          const response = new TextDecoder().decode(data);

          switch (response) {
            case Feedbacks.KoskOk: {
              console.log("Sending attestation");
              const attestationReport = buildAttestation(document, privateKey);

              const attestationPayload = new Sia()
                .addUInt64(attestationReport.attestation.timestamp)
                .addByteArray8(attestationReport.attestation.hash)
                .addByteArray8(attestationReport.attestation.topic)
                .addBool(attestationReport.attestation.correct)
                .addByteArray8(attestationReport.signature).content;

              client?.send(
                new Uint8Array([OpCodes.Attestation, ...attestationPayload]),
              );

              reportIntervalId = setTimeout(() => {
                client?.close();
                reject({
                  reason: RejectReasons.Timeout,
                });
              }, REPORT_TIMEOUT);
              break;
            }
            case Feedbacks.ConfOk:
              break;
            case Feedbacks.SignatureAccepted:
              reportIntervalId && clearInterval(reportIntervalId);
              client?.close();
              resolve();
              break;
            case Feedbacks.SignatureInvalid:
              reportIntervalId && clearInterval(reportIntervalId);
              client?.close();
              reject({
                reason: RejectReasons.InvalidSignature,
              });
              break;
            default:
              console.error("Unknown broker feedback:", response);
          }

          break;
        }
        case OpCodes.KoskChallenge: {
          console.log("Sending kosk challenge");
          const koskPayload = buildKoskPayload(data, privateKey);
          const payload = new Sia()
            .addBool(false)
            .addByteArray8(koskPayload.random)
            .addByteArray8(koskPayload.signature).content;
          client?.send(new Uint8Array([OpCodes.KoskResult, ...payload]));
          break;
        }
        default:
          reject(new Error("Unknown call code"));
      }
    };
  });

function buildAttestation(document: Attestation, privateKey: string | null) {
  if (!privateKey) {
    throw new Error("No signature to send");
  }
  const dst = { DST: "UNCHAINED" };

  const rawDocument = new Sia()
    .addUInt64(document.timestamp)
    .addByteArray8(document.hash)
    .addByteArray8(document.topic)
    .addBool(document.correct).content;

  console.log(Buffer.from(rawDocument).toString("hex"));
  console.log(Buffer.from(document.topic).toString("hex"));
  const signature = bls12_381.signShortSignature(rawDocument, privateKey, dst);

  return {
    attestation: document,
    signature,
  } as AttestationReport;
}

function buildHelloPayload(privateKey: string, name: string): Uint8Array {
  const publicKey = bls12_381.getPublicKeyForShortSignatures(privateKey);
  const shortPublicKey = bls12_381.getPublicKey(privateKey);

  const hello: Signer = {
    name: name.replace(" ", "_"),
    evmWallet: "0x...",
    publicKey,
    shortPublicKey,
  };

  return new Sia()
    .addString8(hello.name)
    .addString8(hello.evmWallet)
    .addByteArray8(hello.publicKey)
    .addByteArray8(hello.shortPublicKey).content;
}

function buildKoskPayload(data: Uint8Array, privateKey: string) {
  const sia = new Sia().setContent(data);
  const challenge: Challenge = {
    passed: sia.readBool(),
    random: sia.readByteArray8(),
    signature: sia.readByteArray8(),
  };

  const dst = { DST: "UNCHAINED" };
  const signature = bls12_381.signShortSignature(
    challenge.random,
    privateKey,
    dst,
  );
  challenge.signature = signature;
  return challenge;
}

function handleBrokerError(data: Uint8Array) {
  const error = new TextDecoder().decode(data);
  console.error("Broker error:", error);
  return error;
}

export function generateSecureRandom() {
  const targetValue = BigInt(
    "0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001",
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

export function getPublicKey(privateKey: string | null) {
  if (!privateKey) {
    return null;
  }
  return toHex(bls12_381.getPublicKeyForShortSignatures(privateKey));
}

export function base64ToQrData(data: string): QrData {
  const dataArray = base64.toByteArray(data);
  const sia = new Sia().setContent(dataArray);

  return {
    data: {
      timestamp: sia.readUInt64(),
      hash: sia.readByteArray8(),
      topic: sia.readByteArray8(),
      correct: sia.readBool(),
    },
    url: sia.readString8(),
  };
}
