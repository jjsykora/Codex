import clsx from 'clsx';
import type { ChatMessage } from '@/lib/types';

const roleStyles: Record<ChatMessage['role'], string> = {
  user: 'bg-slate-800 text-slate-100',
  assistant: 'bg-slate-900 text-slate-100',
  system: 'bg-slate-700 text-slate-100'
};

export default function ChatMessageCard({ message }: { message: ChatMessage }) {
  return (
    <div
      className={clsx(
        'w-full rounded-2xl border border-slate-800 px-4 py-3 shadow-sm',
        roleStyles[message.role]
      )}
    >
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {message.role}
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
        {message.content}
      </p>
    </div>
  );
}
