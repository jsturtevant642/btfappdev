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

function toIsoDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

exports.handler = async function handler(event) {
  if (!isAuthorized(event)) {
    return unauthorizedResponse();
  }

  const supabase = createServiceClient();
  const sevenDaysAgo = toIsoDaysAgo(7);

  const [profilesResult, plansResult, workoutsResult, activitiesResult, apiLogsResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, created_at, subscription_status")
        .order("created_at", { ascending: false }),
      supabase.from("plans").select("id, user_id, is_active, created_at"),
      supabase.from("workout_logs").select("id, user_id, completed_at"),
      supabase.from("activity_logs").select("id, user_id, activity_type, created_at"),
      supabase
        .from("api_usage_logs")
        .select("user_id, created_at")
        .gte("created_at", sevenDaysAgo),
    ]);

  const firstError =
    profilesResult.error ||
    plansResult.error ||
    workoutsResult.error ||
    activitiesResult.error ||
    apiLogsResult.error;

  if (firstError) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: firstError.message }),
    };
  }

  const profiles = profilesResult.data || [];
  const plans = plansResult.data || [];
  const workoutLogs = workoutsResult.data || [];
  const activityLogs = activitiesResult.data || [];
  const apiLogs = apiLogsResult.data || [];

  const activeUsers7d = new Set([
    ...workoutLogs
      .filter((entry) => entry.completed_at && entry.completed_at >= sevenDaysAgo)
      .map((entry) => entry.user_id),
    ...activityLogs
      .filter((entry) => entry.created_at && entry.created_at >= sevenDaysAgo)
      .map((entry) => entry.user_id),
    ...apiLogs.map((entry) => entry.user_id),
  ].filter(Boolean)).size;

  const activityBreakdownMap = new Map();
  for (const activity of activityLogs) {
    const currentCount = activityBreakdownMap.get(activity.activity_type) || 0;
    activityBreakdownMap.set(activity.activity_type, currentCount + 1);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: {
        totalUsers: profiles.length,
        usersLast7d: profiles.filter((profile) => profile.created_at >= sevenDaysAgo).length,
        proUsers: profiles.filter((profile) => profile.subscription_status === "pro").length,
        activeUsers7d,
        totalPlans: plans.length,
        activePlans: plans.filter((plan) => plan.is_active).length,
        workoutLogs: workoutLogs.length,
        flexActivities: activityLogs.length,
      },
      recentSignups: profiles.slice(0, 10).map((profile) => ({
        email: profile.email,
        createdAt: profile.created_at,
        subscriptionStatus: profile.subscription_status,
      })),
      activityBreakdown: [...activityBreakdownMap.entries()]
        .map(([activityType, count]) => ({ activityType, count }))
        .sort((a, b) => b.count - a.count),
    }),
  };
};
