import { useState } from 'react';

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading: boolean;
};

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3"
    >
      <input
        className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        placeholder="Ask a question about your documents"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={isLoading}
      />
      <button
        type="submit"
        className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        disabled={isLoading}
      >
        {isLoading ? 'Thinking...' : 'Send'}
      </button>
    </form>
  );
}
