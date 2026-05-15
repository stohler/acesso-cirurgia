"use client";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function fromBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function pemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, "");
  const bytes = fromBase64(b64);
  return bytes.buffer;
}

function privatePemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const bytes = fromBase64(b64);
  return bytes.buffer;
}

export async function encryptTriagePayload(params: {
  publicKeyPem: string;
  sensitiveData: Record<string, string>;
  fileBuffer: ArrayBuffer;
}) {
  const symmetricKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const ivData = crypto.getRandomValues(new Uint8Array(12));
  const ivFile = crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivData },
    symmetricKey,
    encoder.encode(JSON.stringify(params.sensitiveData)),
  );

  const encryptedFile = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivFile },
    symmetricKey,
    params.fileBuffer,
  );

  const rawSymmetricKey = await crypto.subtle.exportKey("raw", symmetricKey);
  const publicKey = await crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(params.publicKeyPem),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );

  const encryptedSymmetricKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawSymmetricKey,
  );

  return {
    encryptedDataBase64: toBase64(new Uint8Array(encryptedData)),
    encryptedFileBytes: new Uint8Array(encryptedFile),
    encryptedSymmetricKeyBase64: toBase64(new Uint8Array(encryptedSymmetricKey)),
    dataIvBase64: toBase64(ivData),
    fileIvBase64: toBase64(ivFile),
  };
}

export async function decryptSensitivePayload(params: {
  privateKeyPem: string;
  encryptedDataBase64: string;
  encryptedSymmetricKeyBase64: string;
  ivBase64: string;
}) {
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privatePemToArrayBuffer(params.privateKeyPem),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["decrypt"],
  );

  const symmetricRaw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    fromBase64(params.encryptedSymmetricKeyBase64),
  );

  const symmetricKey = await crypto.subtle.importKey(
    "raw",
    symmetricRaw,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(params.ivBase64) },
    symmetricKey,
    fromBase64(params.encryptedDataBase64),
  );

  return JSON.parse(decoder.decode(decrypted)) as Record<string, string>;
}

export async function decryptAttachment(params: {
  privateKeyPem: string;
  encryptedSymmetricKeyBase64: string;
  fileIvBase64: string;
  encryptedFileBuffer: ArrayBuffer;
}) {
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privatePemToArrayBuffer(params.privateKeyPem),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["decrypt"],
  );

  const symmetricRaw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    fromBase64(params.encryptedSymmetricKeyBase64),
  );

  const symmetricKey = await crypto.subtle.importKey(
    "raw",
    symmetricRaw,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(params.fileIvBase64) },
    symmetricKey,
    params.encryptedFileBuffer,
  );
}
