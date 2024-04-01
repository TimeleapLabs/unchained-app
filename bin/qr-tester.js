const { Sia } = require("sializer");
const base64 = require("base64-js");
const qrcode = require("qrcode-terminal");

const getRandom64 = () => {
  return new Uint8Array(64).map(() => Math.floor(Math.random() * 256));
};

const hexToUint8Array = (hex) => {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
};

const qrData = {
  // url: "ws://192.168.1.59:4444/0.11.17",
  url: "https://shinobi.brokers.kenshi.io/0.11.21",
  data: {
    timestamp: Math.floor(Date.now() / 1000),
    hash: getRandom64(),
    topic: hexToUint8Array(
      "1ce3d8f55311bf6fe438a273bb0b91bc923c81fc6c1547829b1c26029a8edc3afaa602c6cbf57abf09ab6d2b1750e7bc32aaddab5b0a65fc1f1d97d6cb76de15",
    ),
    correct: true,
  },
};

const correctnessPayload = new Sia()
  .addUInt64(qrData.data.timestamp)
  .addByteArray8(qrData.data.hash)
  .addByteArray8(qrData.data.topic)
  .addBool(qrData.data.correct)
  .addString8(qrData.url).content;

const qrCode = base64.fromByteArray(correctnessPayload);

qrcode.generate(qrCode, { small: true });
