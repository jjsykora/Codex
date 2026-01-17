import type { SourceDocument } from '@/lib/types';
import clsx from 'clsx';

export default function SourcePanel({
  sources,
  isOpen,
  onClose
}: {
  sources: SourceDocument[];
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={clsx(
        'fixed right-0 top-0 z-20 flex h-full w-full max-w-sm flex-col border-l border-slate-800 bg-slate-950 p-6 shadow-2xl transition-transform md:relative md:translate-x-0',
        isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sources</h2>
        <button
          onClick={onClose}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase text-slate-300 md:hidden"
        >
          Close
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Showing the documents used to answer your question.
      </p>
      <div className="mt-4 space-y-4 overflow-y-auto pr-1 scrollbar-hidden">
        {sources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-4 text-sm text-slate-500">
            Ask a question to see retrieved documents here.
          </div>
        ) : (
          sources.map((source) => (
            <div
              key={source.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">
                  {source.title}
                </h3>
                <span className="text-xs text-cyan-400">
                  {source.score.toFixed(3)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{source.snippet}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
