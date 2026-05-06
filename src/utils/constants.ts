export const CATEGORIES = {
  study: { label: '学习', color: '#6366F1' },
  life: { label: '生活', color: '#10B981' },
  work: { label: '工作', color: '#F59E0B' },
  sleep: { label: '睡觉', color: '#8B8B8E' },
  entertainment: { label: '娱乐', color: '#EC4899' },
  sports: { label: '运动', color: '#F97316' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([key, val]) => ({
  value: key as CategoryKey,
  label: val.label,
  color: val.color,
}));