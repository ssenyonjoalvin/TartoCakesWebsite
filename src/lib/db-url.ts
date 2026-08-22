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
  };
}
