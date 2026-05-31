const crypto = require("node:crypto");

const COOKIE_NAME = "routine_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseCookies(headerValue = "") {
  return headerValue.split(";").reduce((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function signPayload(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function createSessionCookie() {
  const secret = getRequiredEnv("ROUTINE_ADMIN_SESSION_SECRET");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const signature = signPayload(payload, secret);
  const value = `${payload}.${signature}`;
  const expires = new Date(expiresAt).toUTCString();

  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function isAuthorized(event) {
  try {
    const secret = getRequiredEnv("ROUTINE_ADMIN_SESSION_SECRET");
    const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || "");
    const rawValue = cookies[COOKIE_NAME];
    if (!rawValue) return false;

    const [payload, signature] = rawValue.split(".");
    if (!payload || !signature) return false;
    if (signPayload(payload, secret) !== signature) return false;

    return Number(payload) > Date.now();
  } catch {
    return false;
  }
}

function unauthorizedResponse() {
  return {
    statusCode: 401,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Unauthorized" }),
  };
}

module.exports = {
  clearSessionCookie,
  createSessionCookie,
  getRequiredEnv,
  isAuthorized,
  unauthorizedResponse,
};
