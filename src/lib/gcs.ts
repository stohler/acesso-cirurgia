import { Storage } from "@google-cloud/storage";

let storageClient: Storage | null = null;

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}

function getStorageClient() {
  if (storageClient) {
    return storageClient;
  }

  if (process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
    storageClient = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: normalizePrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY),
      },
    });

    return storageClient;
  }

  storageClient = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
  });

  return storageClient;
}

function getBucketName() {
  const bucket = process.env.GCS_BUCKET_NAME;
  if (!bucket) {
    throw new Error("GCS_BUCKET_NAME não configurada.");
  }

  return bucket;
}

export async function createUploadSignedUrl(objectPath: string, expiresInMinutes = 15) {
  const bucket = getStorageClient().bucket(getBucketName());
  const file = bucket.file(objectPath);

  const [signedUrl] = await file.getSignedUrl({
    action: "write",
    version: "v4",
    expires: Date.now() + expiresInMinutes * 60 * 1000,
    contentType: "application/octet-stream",
  });

  return signedUrl;
}

export async function createDownloadSignedUrl(objectPath: string, expiresInMinutes = 10) {
  const bucket = getStorageClient().bucket(getBucketName());
  const file = bucket.file(objectPath);

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    version: "v4",
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });

  return signedUrl;
}

export async function uploadBinaryObject(params: {
  objectPath: string;
  buffer: Buffer;
  contentType?: string;
}) {
  const bucket = getStorageClient().bucket(getBucketName());
  const file = bucket.file(params.objectPath);

  await file.save(params.buffer, {
    resumable: false,
    contentType: params.contentType ?? "application/octet-stream",
    metadata: {
      cacheControl: "private, max-age=0, no-store",
    },
  });
}
