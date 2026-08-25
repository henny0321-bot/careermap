import type { Tip } from '../types';
import { getCategoryEmoji } from '../data/categoryMeta';

interface Props {
  tip: Tip;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TipCard({ tip, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-base">
            {getCategoryEmoji(tip.category)}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{tip.title}</h3>
            <span className="text-[11px] text-gray-400">{tip.category}</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="text-xs text-gray-400 hover:text-blue-600 px-1.5 py-0.5"
            aria-label="수정"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-gray-400 hover:text-red-500 px-1.5 py-0.5"
            aria-label="삭제"
          >
            🗑️
          </button>
        </div>
      </div>

      {tip.content && (
        <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{tip.content}</p>
      )}

      {tip.links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tip.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              🔗 {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
