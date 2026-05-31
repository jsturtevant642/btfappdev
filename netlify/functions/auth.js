const {
  clearSessionCookie,
  createSessionCookie,
  getRequiredEnv,
} = require("./_auth");

exports.handler = async function handler(event) {
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearSessionCookie(),
      },
      body: JSON.stringify({ ok: true, loggedOut: true }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "GET, POST" },
      body: "Method Not Allowed",
    };
  }

  const expectedCode = getRequiredEnv("ROUTINE_ADMIN_ACCESS_CODE");
  const body = event.body ? JSON.parse(event.body) : {};
  const accessCode = String(body.accessCode || "");

  if (!accessCode || accessCode !== expectedCode) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid access code" }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": createSessionCookie(),
    },
    body: JSON.stringify({ ok: true }),
  };
};
