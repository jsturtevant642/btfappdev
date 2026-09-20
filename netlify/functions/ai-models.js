const {
  getRequiredEnv,
  isAuthorized,
  unauthorizedResponse,
} = require("./_auth");

exports.handler = async function handler(event) {
  if (!isAuthorized(event)) {
    return unauthorizedResponse();
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
    body: JSON.stringify({ operation: "list_models" }),
  });

  const payload = await response.text();

  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: payload,
  };
};
