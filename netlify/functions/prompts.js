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

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("system_prompts")
    .select("id, prompt_key, description, version, content, is_active, metadata, created_at, updated_at")
    .order("prompt_key", { ascending: true })
    .order("version", { ascending: false });

  if (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }

  const grouped = new Map();

  for (const row of data || []) {
    const existing = grouped.get(row.prompt_key) || {
      promptKey: row.prompt_key,
      description: row.description || "",
      activePrompt: null,
      versions: [],
    };

    const versionEntry = {
      id: row.id,
      version: row.version,
      content: row.content,
      isActive: row.is_active,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      description: row.description || "",
    };

    if (row.is_active) {
      existing.activePrompt = versionEntry;
      existing.description = row.description || existing.description;
    }

    existing.versions.push(versionEntry);
    grouped.set(row.prompt_key, existing);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompts: [...grouped.values()],
    }),
  };
};
