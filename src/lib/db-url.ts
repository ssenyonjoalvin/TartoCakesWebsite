function sslOptionsFor(url: URL) {
  const mode = (
    url.searchParams.get("ssl-mode") ??
    url.searchParams.get("sslmode") ??
    url.searchParams.get("ssl") ??
    ""
  ).toUpperCase();

  if (!mode || mode === "DISABLED" || mode === "FALSE") return undefined;

  // ssl-mode=REQUIRED (Aiven's default) means "encrypt, don't verify the CA".
  // VERIFY_CA / VERIFY_IDENTITY would need an explicit CA cert, which this
  // app doesn't ship, so they fall back to the same relaxed verification.
  return { rejectUnauthorized: false };
}

export function parseDatabaseUrl(raw = process.env.DATABASE_URL) {
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(raw);
  const hostname = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;

  return {
    host: hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "").split("?")[0],
    ssl: sslOptionsFor(url),
  };
}
