export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceDocument[];
};

export type SourceDocument = {
  id: string;
  title: string;
  snippet: string;
  score: number;
};

export type ChatResponse = {
  message: ChatMessage;
  sources: SourceDocument[];
};
