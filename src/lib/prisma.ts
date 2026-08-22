import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { parseDatabaseUrl } from "@/lib/db-url";

type MariaAdapter = Awaited<ReturnType<PrismaMariaDb["connect"]>>;
type MariaPool = ReturnType<MariaAdapter["underlyingDriver"]> & {
  closed?: boolean;
  __nativeEnd?: () => Promise<void>;
};

type PrismaStore = {
  client?: PrismaClient;
  adapter?: MariaAdapter;
  recovering?: boolean;
  shutdownHook?: boolean;
};

const globalForPrisma = globalThis as typeof globalThis & {
  __tartoPrisma?: PrismaStore;
};
const store: PrismaStore = (globalForPrisma.__tartoPrisma ??= {});

function envInt(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function poolOptions() {
  const db = parseDatabaseUrl();
  const isProd = process.env.NODE_ENV === "production";

  return {
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    connectionLimit: envInt("DATABASE_CONNECTION_LIMIT", isProd ? 10 : 5),
    acquireTimeout: envInt("DATABASE_ACQUIRE_TIMEOUT_MS", 20_000),
    connectTimeout: envInt("DATABASE_CONNECT_TIMEOUT_MS", 8_000),
    initializationTimeout: envInt("DATABASE_INIT_TIMEOUT_MS", 12_000),
    idleTimeout: 0,
    allowPublicKeyRetrieval: true,
    resetAfterUse: false,
    keepAliveDelay: 5_000,
    enableKeepAlive: true,
  };
}

function isPoolOpen(pool: MariaPool) {
  return pool.closed !== true;
}

function isPoolError(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message : String(error);
  return (
    code === "P2039" ||
    code === "45028" ||
    /pool timeout|pool is already closed|pool closed|Pool fails to create connection|Error during pool initialization|ECONNRESET|ECONNREFUSED|PROTOCOL_CONNECTION_LOST|Connection lost|Can't add new command when connection is not exists/i.test(
      message
    )
  );
}

function discardAdapter(adapter: MariaAdapter | undefined) {
  if (!adapter) return;
  const pool = adapter.underlyingDriver() as MariaPool;
  const nativeEnd = pool.__nativeEnd;
  if (!nativeEnd) return;
  void Promise.race([
    nativeEnd().catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, 200)),
  ]);
}

function pinAdapter(adapter: MariaAdapter) {
  const pool = adapter.underlyingDriver() as MariaPool;
  if (!pool.__nativeEnd) {
    pool.__nativeEnd = pool.end.bind(pool);
  }
  pool.end = async () => {};
  adapter.dispose = async () => {};
  return adapter;
}

function installShutdownHook() {
  if (store.shutdownHook || typeof process === "undefined") return;
  store.shutdownHook = true;

  const halt = () => {
    process.exit(0);
  };

  process.once("SIGTERM", halt);
  process.once("SIGINT", halt);
}

/**
 * Next.js HMR and Prisma `$disconnect()` call `pool.end()`. That marks the
 * pool closed immediately (`active=0 idle=0`). Keep one adapter for the
 * process and reopen it if it ever dies, including in production.
 */
class PersistentMariaDb extends PrismaMariaDb {
  async connect() {
    if (store.adapter && isPoolOpen(store.adapter.underlyingDriver() as MariaPool)) {
      return store.adapter;
    }

    discardAdapter(store.adapter);
    store.adapter = pinAdapter(await super.connect());
    return store.adapter;
  }
}

function modelKey(model: string) {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function withPoolRetry(client: PrismaClient) {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          try {
            return await query(args);
          } catch (error) {
            if (store.recovering || !isPoolError(error)) throw error;
            store.recovering = true;
            try {
              resetPrisma();
              const next = getClient() as unknown as Record<
                string,
                Record<string, (queryArgs: typeof args) => Promise<unknown>>
              >;
              return await next[modelKey(model)][operation](args);
            } finally {
              store.recovering = false;
            }
          }
        },
      },
    },
  }) as unknown as PrismaClient;
}

function createPrismaClient() {
  installShutdownHook();
  const client = new PrismaClient({
    adapter: new PersistentMariaDb(poolOptions()),
  });
  client.$disconnect = async () => {};
  return withPoolRetry(client);
}

function resetPrisma() {
  discardAdapter(store.adapter);
  store.adapter = undefined;
  store.client = undefined;
}

function getClient() {
  if (store.client) {
    if (!store.adapter || isPoolOpen(store.adapter.underlyingDriver() as MariaPool)) {
      return store.client;
    }
  }

  resetPrisma();
  store.client = createPrismaClient();
  return store.client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
  has(_target, prop) {
    return prop in getClient();
  },
});
