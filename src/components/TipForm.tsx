import { useState } from 'react';
import type { Tip, TipInput, TipLink } from '../types';

interface Props {
  categories: string[];
  initialTip?: Tip;
  onSubmit: (input: TipInput) => void;
  onClose: () => void;
}

export default function TipForm({ categories, initialTip, onSubmit, onClose }: Props) {
  const [category, setCategory] = useState(initialTip?.category ?? categories[0] ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [title, setTitle] = useState(initialTip?.title ?? '');
  const [content, setContent] = useState(initialTip?.content ?? '');
  const [links, setLinks] = useState<TipLink[]>(initialTip?.links ?? []);

  const isNewCategory = category === '__new__';

  const updateLink = (index: number, changes: Partial<TipLink>) => {
    setLinks(prev => prev.map((link, i) => (i === index ? { ...link, ...changes } : link)));
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isNewCategory ? newCategory.trim() : category;
    if (!finalCategory || !title.trim()) return;
    const cleanLinks = links
      .map(l => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter(l => l.label && l.url);
    onSubmit({ category: finalCategory, title: title.trim(), content: content.trim(), links: cleanLinks });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="__new__">+ 새 카테고리 추가</option>
        </select>
        {isNewCategory && (
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="새 카테고리 이름"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: 수강신청 꿀팁"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          placeholder="자유롭게 내용을 적어주세요"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">관련 링크</label>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={link.label}
                onChange={e => updateLink(i, { label: e.target.value })}
                placeholder="링크 이름"
                className="w-1/3 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                value={link.url}
                onChange={e => updateLink(i, { url: e.target.value })}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="text-gray-400 hover:text-red-500 px-2"
                aria-label="링크 삭제"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLinks(prev => [...prev, { label: '', url: '' }])}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
        >
          + 링크 추가
        </button>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </form>
  );
}
