import { ChatMessage, ChatResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export type ChatRequest = {
  message: string;
  provider: 'ollama' | 'vllm';
  history: ChatMessage[];
  useRag: boolean;
};

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: request.message,
      provider: request.provider,
      history: request.history,
      use_rag: request.useRag
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch chat response');
  }

  return response.json() as Promise<ChatResponse>;
}
