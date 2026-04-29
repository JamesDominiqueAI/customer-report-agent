export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";
}

export async function postChatMessage(message: string) {
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

  return response.json() as Promise<{ response?: string; tool?: string; error?: string }>;
}
