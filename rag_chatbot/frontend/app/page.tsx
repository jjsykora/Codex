'use client';

import { useMemo, useState } from 'react';
import ChatInput from '@/components/ChatInput';
import ChatMessageCard from '@/components/ChatMessage';
import SourcePanel from '@/components/SourcePanel';
import { sendChat } from '@/lib/api';
import type { ChatMessage, SourceDocument } from '@/lib/types';

const initialMessages: ChatMessage[] = [
  {
    id: 'system-1',
    role: 'system',
    content:
      'Ask me about your indexed documents. I can answer with sources from Elasticsearch.'
  }
];

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<'ollama' | 'vllm'>('ollama');
  const [useRag, setUseRag] = useState(true);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const lastAssistantSources = useMemo(() => {
    return sources.length > 0 ? sources : [];
  }, [sources]);

  const handleSend = async (message: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChat({
        message,
        provider,
        history: messages,
        useRag
      });

      setMessages((prev) => [...prev, response.message]);
      setSources(response.sources ?? []);
      if (response.sources && response.sources.length > 0) {
        setSourcesOpen(true);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          error instanceof Error
            ? `Something went wrong: ${error.message}`
            : 'Something went wrong while fetching the response.'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">RAG Chatbot</h1>
            <p className="text-sm text-slate-400">
              Retrieval augmented chat with Elasticsearch + LangChain.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs">
              <span className="text-slate-400">Provider</span>
              <select
                value={provider}
                onChange={(event) =>
                  setProvider(event.target.value as 'ollama' | 'vllm')
                }
                className="bg-transparent text-slate-100 focus:outline-none"
              >
                <option value="ollama">Ollama</option>
                <option value="vllm">vLLM</option>
              </select>
            </div>
            <label className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={useRag}
                onChange={(event) => setUseRag(event.target.checked)}
                className="h-3 w-3 accent-cyan-400"
              />
              Use RAG
            </label>
            <button
              onClick={() => setSourcesOpen(true)}
              className="rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"
            >
              View Sources
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 py-8">
        <section className="flex w-full flex-col gap-6">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {messages.map((message) => (
              <ChatMessageCard key={message.id} message={message} />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
            {lastAssistantSources.length > 0
              ? `${lastAssistantSources.length} source documents retrieved for the last answer.`
              : 'No sources retrieved yet. Turn on RAG to cite documents.'}
          </div>
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </section>

        <div className="hidden md:block">
          <SourcePanel
            sources={sources}
            isOpen={true}
            onClose={() => setSourcesOpen(false)}
          />
        </div>
      </main>

      <div className="md:hidden">
        <SourcePanel
          sources={sources}
          isOpen={sourcesOpen}
          onClose={() => setSourcesOpen(false)}
        />
      </div>
    </div>
  );
}
