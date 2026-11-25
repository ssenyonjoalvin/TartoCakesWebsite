export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("Set AUTH_SECRET to at least 32 characters before running in production.");
  }
  return secret || "tarto-dev-secret-change-me";
}
