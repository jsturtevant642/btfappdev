const crypto = require("node:crypto");
const { getStore } = require("@netlify/blobs");
const { isAuthorized, unauthorizedResponse } = require("./_auth");

const STORE_NAME = "btf-waitlist";
const SUBMISSIONS_KEY = "submissions";
const MAX_SUBMISSIONS = 1000;

const PRODUCT_LABELS = {
  "Routine Fitness": "Routine Fitness",
  JRNY: "JRNY",
  MyProxy: "MyProxy",
  "Remix Career": "Remix Career",
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function redirectResponse(location) {
  return {
    statusCode: 303,
    headers: { Location: location },
    body: "",
  };
}

function parseBody(event) {
  if (!event.body) return {};

  const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  if (contentType.includes("application/json")) {
    return JSON.parse(rawBody);
  }

  const params = new URLSearchParams(rawBody);
  return Object.fromEntries(params.entries());
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getSubmissionsStore() {
  return getStore(STORE_NAME);
}

async function readSubmissions(store) {
  const submissions = await store.get(SUBMISSIONS_KEY, { type: "json" });
  return Array.isArray(submissions) ? submissions : [];
}

async function saveSubmission(event) {
  const body = parseBody(event);

  if (body["bot-field"]) {
    return redirectResponse("/thanks/");
  }

  const email = normalizeEmail(body.email);
  const product = PRODUCT_LABELS[String(body.product || "")] || String(body.product || "Unknown product");
  const formName = String(body["form-name"] || body.formName || "waitlist");

  if (!isValidEmail(email)) {
    return jsonResponse(400, { error: "Please enter a valid email address." });
  }

  const store = await getSubmissionsStore();
  const submissions = await readSubmissions(store);
  const submission = {
    id: crypto.randomUUID(),
    email,
    product,
    formName,
    createdAt: new Date().toISOString(),
    sourcePath: event.headers.referer || event.headers.Referer || "",
  };

  submissions.unshift(submission);
  await store.setJSON(SUBMISSIONS_KEY, submissions.slice(0, MAX_SUBMISSIONS));

  return redirectResponse("/thanks/");
}

async function listSubmissions(event) {
  if (!isAuthorized(event)) {
    return unauthorizedResponse();
  }

  const store = await getSubmissionsStore();
  const submissions = await readSubmissions(store);

  return jsonResponse(200, { submissions });
}

exports.handler = async function handler(event) {
  try {
    if (event.httpMethod === "POST") {
      return saveSubmission(event);
    }

    if (event.httpMethod === "GET") {
      return listSubmissions(event);
    }

    return {
      statusCode: 405,
      headers: { Allow: "GET, POST" },
      body: "Method Not Allowed",
    };
  } catch (error) {
    console.error("Waitlist function error", error);
    return jsonResponse(500, { error: "Unable to process waitlist request." });
  }
};
