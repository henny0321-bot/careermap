export const CATEGORY_META: Record<string, { emoji: string }> = {
  수강신청: { emoji: '🗓️' },
  연구: { emoji: '📚' },
  '대학 생활': { emoji: '🏫' },
};

export const DEFAULT_EMOJI = '📌';

export function getCategoryEmoji(category: string): string {
  return CATEGORY_META[category]?.emoji ?? DEFAULT_EMOJI;
}
