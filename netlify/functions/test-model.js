const {
  getRequiredEnv,
  isAuthorized,
  unauthorizedResponse,
} = require("./_auth");

exports.handler = async function handler(event) {
  if (!isAuthorized(event)) {
    return unauthorizedResponse();
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method Not Allowed",
    };
  }

  const body = event.body ? JSON.parse(event.body) : {};
  const model = String(body.model || "").trim();
  if (!model) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Model is required." }),
    };
  }

  const supabaseUrl = getRequiredEnv("ROUTINE_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("ROUTINE_SUPABASE_SERVICE_ROLE_KEY");
  const adminAccessCode = getRequiredEnv("ROUTINE_ADMIN_ACCESS_CODE");

  const response = await fetch(`${supabaseUrl}/functions/v1/admin-ai-models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "x-admin-access-code": adminAccessCode,
    },
    body: JSON.stringify({
      operation: "test_model",
      model,
    }),
  });

  const payload = await response.text();

  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: payload,
  };
};
