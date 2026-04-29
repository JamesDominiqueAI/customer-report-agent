export function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://customer-report-agent-api.vercel.app";
  }

  return "http://localhost:8010";
}

function getApiHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  const supportManagerKey = process.env.NEXT_PUBLIC_SUPPORT_MANAGER_API_KEY;
  if (supportManagerKey) {
    headers["X-Support-Manager-Key"] = supportManagerKey;
  }
  return headers;
}

function getOptionalAuthHeaders() {
  const supportManagerKey = process.env.NEXT_PUBLIC_SUPPORT_MANAGER_API_KEY;
  return supportManagerKey ? { "X-Support-Manager-Key": supportManagerKey } : undefined;
}

export type Complaint = {
  id: string;
  customer: string;
  channel: string;
  category: string;
  urgency: "high" | "medium" | "low";
  sentiment: "positive" | "neutral" | "mixed" | "negative";
  createdAt: string;
  text: string;
  recommendedAction: string;
};

export type ComplaintSummary = {
  total: number;
  urgent: number;
  negative: number;
  topCategory: string;
  topCategoryCount: number;
};

export async function postChatMessage(message: string) {
  const startedAt = performance.now();
  const response = await fetch(`${getApiUrl()}/api/chat`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with ${response.status}`);
  }

  const data = await response.json() as {
    response?: string;
    tool?: string;
    source?: string;
    traceId?: string;
    latencyMs?: number;
    error?: string;
  };
  return {
    ...data,
    responseTimeMs: Math.round(performance.now() - startedAt)
  };
}

export async function getComplaintSummary() {
  const response = await fetch(`${getApiUrl()}/api/summary`, {
    headers: getOptionalAuthHeaders()
  });
  if (!response.ok) {
    throw new Error(`Summary request failed with ${response.status}`);
  }
  return response.json() as Promise<ComplaintSummary>;
}

export async function getComplaints(filters: { sentiment: string; urgency: string; query: string }) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${getApiUrl()}/api/complaints?${params.toString()}`, {
    headers: getOptionalAuthHeaders()
  });
  if (!response.ok) {
    throw new Error(`Complaint request failed with ${response.status}`);
  }
  return response.json() as Promise<Complaint[]>;
}

function getCsvExportUrl(filters: { sentiment: string; urgency: string; query: string }) {
  const params = new URLSearchParams(filters);
  return `${getApiUrl()}/api/export.csv?${params.toString()}`;
}

export async function fetchCsvExport(filters: { sentiment: string; urgency: string; query: string }) {
  const response = await fetch(getCsvExportUrl(filters), {
    headers: getOptionalAuthHeaders()
  });
  if (!response.ok) {
    throw new Error(`CSV export failed with ${response.status}`);
  }
  return response.text();
}
