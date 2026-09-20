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
  const promptKey = String(body.promptKey || "").trim();
  const content = String(body.content || "").trim();
  const description = String(body.description || "").trim();
  const changeNote = String(body.changeNote || "").trim();

  if (!promptKey) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Prompt key is required." }),
    };
  }

  if (!content) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Prompt content is required." }),
    };
  }

  const supabase = createServiceClient();
  const { data: existingRows, error: existingError } = await supabase
    .from("system_prompts")
    .select("id, prompt_key, description, version, content, is_active, metadata")
    .eq("prompt_key", promptKey)
    .order("version", { ascending: false });

  if (existingError) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: existingError.message }),
    };
  }

  const rows = existingRows || [];
  const activeRow = rows.find((row) => row.is_active) || null;
  const nextVersion = (rows[0]?.version || 0) + 1;
  const mergedMetadata = {
    ...(activeRow?.metadata || {}),
    last_change_note: changeNote || null,
    committed_via: "btfappdev_admin",
    committed_at: new Date().toISOString(),
  };

  if (activeRow) {
    const { error: deactivateError } = await supabase
      .from("system_prompts")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", activeRow.id);

    if (deactivateError) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: deactivateError.message }),
      };
    }
  }

  const { data: insertedRows, error: insertError } = await supabase
    .from("system_prompts")
    .insert({
      prompt_key: promptKey,
      description: description || activeRow?.description || null,
      version: nextVersion,
      content,
      is_active: true,
      metadata: mergedMetadata,
      updated_at: new Date().toISOString(),
    })
    .select("id, prompt_key, description, version, content, is_active, metadata, created_at, updated_at")
    .limit(1);

  if (insertError) {
    if (activeRow) {
      await supabase
        .from("system_prompts")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", activeRow.id);
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: insertError.message }),
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ok: true,
      prompt: insertedRows?.[0] || null,
    }),
  };
};
