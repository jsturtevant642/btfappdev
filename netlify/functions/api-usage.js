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
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const [logsResult, alertsResult] = await Promise.all([
    supabase
      .from("api_usage_logs")
      .select(
        "endpoint, model, tokens_used, cost_estimate, success, error_message, created_at, user_id"
      )
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_alerts")
      .select("severity, title, message, created_at, acknowledged_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (logsResult.error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: logsResult.error.message }),
    };
  }

  const logs = logsResult.data || [];
  const alerts = alertsResult.error ? [] : alertsResult.data || [];
  const uniqueUsers = new Set(logs.map((log) => log.user_id).filter(Boolean)).size;

  const dailyUsageMap = new Map();
  const endpointUsageMap = new Map();

  for (const log of logs) {
    const date = String(log.created_at || "").split("T")[0];
    const existingDay = dailyUsageMap.get(date) || {
      date,
      requestCount: 0,
      failedCount: 0,
      totalCostUsd: 0,
      totalTokens: 0,
    };
    existingDay.requestCount += 1;
    existingDay.failedCount += log.success ? 0 : 1;
    existingDay.totalCostUsd += Number(log.cost_estimate || 0);
    existingDay.totalTokens += Number(log.tokens_used || 0);
    dailyUsageMap.set(date, existingDay);

    const existingEndpoint = endpointUsageMap.get(log.endpoint) || {
      endpoint: log.endpoint,
      requestCount: 0,
      failedCount: 0,
      totalCostUsd: 0,
    };
    existingEndpoint.requestCount += 1;
    existingEndpoint.failedCount += log.success ? 0 : 1;
    existingEndpoint.totalCostUsd += Number(log.cost_estimate || 0);
    endpointUsageMap.set(log.endpoint, existingEndpoint);
  }

  const totalRequests = logs.length;
  const failedRequests = logs.filter((log) => !log.success).length;
  const successfulRequests = totalRequests - failedRequests;
  const totalCostUsd = logs.reduce((sum, log) => sum + Number(log.cost_estimate || 0), 0);
  const totalTokens = logs.reduce((sum, log) => sum + Number(log.tokens_used || 0), 0);
  const recentErrors = logs
    .filter((log) => !log.success && log.error_message)
    .slice(0, 10)
    .map((log) => ({
      endpoint: log.endpoint,
      errorMessage: log.error_message,
      createdAt: log.created_at,
    }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: totalRequests === 0 ? 0 : successfulRequests / totalRequests,
        totalCostUsd,
        totalTokens,
        uniqueUsers,
      },
      dailyUsage: [...dailyUsageMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
      endpointUsage: [...endpointUsageMap.values()].sort(
        (a, b) => b.requestCount - a.requestCount
      ),
      recentErrors,
      alerts,
    }),
  };
};
