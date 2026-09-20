async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatDateTime(value) {
  if (!value) return "n/a";
  return new Date(value).toLocaleString();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStats(target, items) {
  target.innerHTML = items
    .map(
      (item) => `
        <div class="stat-card">
          <div class="stat-label">${escapeHtml(item.label)}</div>
          <div class="stat-value">${escapeHtml(item.value)}</div>
          ${item.meta ? `<div class="muted" style="margin-top:8px;font-size:13px;">${escapeHtml(item.meta)}</div>` : ""}
        </div>
      `
    )
    .join("");
}

function renderBarChart(target, rows, formatter = formatNumber) {
  const maxValue = Math.max(...rows.map((row) => Number(row.value || 0)), 1);
  target.innerHTML = rows
    .map((row) => {
      const width = Math.max(6, (Number(row.value || 0) / maxValue) * 100);
      return `
        <div class="chart-row">
          <div class="muted">${escapeHtml(row.label)}</div>
          <div class="chart-bar-shell"><div class="chart-bar" style="width:${width}%"></div></div>
          <div>${escapeHtml(formatter(row.value))}</div>
        </div>
      `;
    })
    .join("");
}

async function requireSession() {
  try {
    await requestJson("/.netlify/functions/session");
    return true;
  } catch (error) {
    if (error.status === 401) {
      window.location.replace("/routine-ops/");
      return false;
    }

    throw error;
  }
}

async function logout() {
  await fetch("/.netlify/functions/auth", { method: "GET", credentials: "include" });
  window.location.replace("/routine-ops/");
}

window.RoutineOps = {
  escapeHtml,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
  logout,
  renderBarChart,
  renderStats,
  requestJson,
  requireSession,
};
