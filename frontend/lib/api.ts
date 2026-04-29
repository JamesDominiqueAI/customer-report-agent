export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";
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
    headers: {
      "Content-Type": "application/json"
    },
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
  const response = await fetch(`${getApiUrl()}/api/summary`);
  if (!response.ok) {
    throw new Error(`Summary request failed with ${response.status}`);
  }
  return response.json() as Promise<ComplaintSummary>;
}

export async function getComplaints(filters: { sentiment: string; urgency: string; query: string }) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${getApiUrl()}/api/complaints?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Complaint request failed with ${response.status}`);
  }
  return response.json() as Promise<Complaint[]>;
}

export function getCsvExportUrl(filters: { sentiment: string; urgency: string; query: string }) {
  const params = new URLSearchParams(filters);
  return `${getApiUrl()}/api/export.csv?${params.toString()}`;
}
