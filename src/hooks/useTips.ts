import { useCallback, useEffect, useState } from 'react';
import type { Tip, TipInput } from '../types';
import { CATEGORY_ORDER, DEFAULT_TIPS } from '../data/defaultTips';

const STORAGE_KEY = 'snu-grad-guide-tips-v2';

function loadTips(): Tip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Tip[];
  } catch {
    // ignore malformed storage and fall back to defaults
  }
  return DEFAULT_TIPS;
}

function saveTips(tips: Tip[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tips));
  } catch {
    // storage unavailable (private mode, quota) - changes stay in-memory only
  }
}

export function useTips() {
  const [tips, setTips] = useState<Tip[]>(loadTips);

  useEffect(() => {
    saveTips(tips);
  }, [tips]);

  const addTip = useCallback((input: TipInput) => {
    setTips(prev => [
      ...prev,
      { ...input, id: crypto.randomUUID(), createdAt: Date.now() },
    ]);
  }, []);

  const updateTip = useCallback((id: string, input: TipInput) => {
    setTips(prev => prev.map(tip => (tip.id === id ? { ...tip, ...input } : tip)));
  }, []);

  const deleteTip = useCallback((id: string) => {
    setTips(prev => prev.filter(tip => tip.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setTips(DEFAULT_TIPS);
  }, []);

  const usedCategories = Array.from(new Set(tips.map(t => t.category)));
  const categories = [
    ...CATEGORY_ORDER.filter(c => usedCategories.includes(c)),
    ...usedCategories.filter(c => !CATEGORY_ORDER.includes(c)),
  ];

  return { tips, categories, addTip, updateTip, deleteTip, resetToDefaults };
}
