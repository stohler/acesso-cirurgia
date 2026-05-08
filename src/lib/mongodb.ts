import mongoose from "mongoose";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI não configurada.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME ?? "agende-sua-cirurgia",
      maxPoolSize: 20,
      minPoolSize: 2,
      retryWrites: true,
      appName: "AgendeSuaCirurgiaCloudRun",
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export async function withMongoTransaction<T>(fn: (session: mongoose.ClientSession) => Promise<T>) {
  const conn = await connectToDatabase();
  const session = await conn.startSession();

  try {
    let value: T | undefined;
    await session.withTransaction(async () => {
      value = await fn(session);
    });

    if (value === undefined) {
      throw new Error("Transação concluída sem retorno.");
    }

    return value;
  } finally {
    await session.endSession();
  }
}
