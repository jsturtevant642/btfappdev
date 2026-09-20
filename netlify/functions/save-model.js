const { createClient } = require("@supabase/supabase-js");
const {
  getRequiredEnv,
  isAuthorized,
  unauthorizedResponse,
} = require("./_auth");

function createServiceClient() {
  return createClient(
    getRequiredEnv("ROUTINE_SUPABASE_URL"),
    getRequiredEnv("ROUTINE_SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

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

  const supabase = createServiceClient();
  const { data: existingRow, error: existingError } = await supabase
    .from("feature_flags")
    .select("payload")
    .eq("key", "ai_runtime_config")
    .maybeSingle();

  if (existingError) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: existingError.message }),
    };
  }

  const nextPayload = {
    ...(existingRow?.payload || {}),
    model,
    updatedFrom: "btfappdev_admin",
    updatedAt: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase.from("feature_flags").upsert(
    {
      key: "ai_runtime_config",
      description: "Controls runtime AI settings such as the active OpenAI model.",
      is_enabled: true,
      payload: nextPayload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (upsertError) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: upsertError.message }),
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, model }),
  };
};
