import type { TimeBlock } from '@/services/timeBlockService';
import type { CategoryKey } from '@/utils/constants';
import { CATEGORIES } from '@/utils/constants';

export interface CategoryStat {
  category: CategoryKey;
  label: string;
  color: string;
  hours: number;
  percentage: number;
}

export interface DayTrend {
  date: string;
  label: string;
  [category: string]: string | number;
}

export interface TopActivity {
  title: string;
  category: CategoryKey;
  label: string;
  color: string;
  totalHours: number;
  count: number;
}

export function computeCategoryStats(blocks: TimeBlock[]): CategoryStat[] {
  const totalMs = blocks.reduce((sum, b) => sum + (b.end.getTime() - b.start.getTime()), 0);
  if (totalMs === 0) return [];

  const map = new Map<CategoryKey, number>();
  for (const b of blocks) {
    const ms = b.end.getTime() - b.start.getTime();
    map.set(b.category, (map.get(b.category) ?? 0) + ms);
  }

  return Array.from(map.entries())
    .map(([cat, ms]) => ({
      category: cat,
      label: CATEGORIES[cat]?.label ?? cat,
      color: CATEGORIES[cat]?.color ?? '#6B7280',
      hours: Math.round((ms / 3600000) * 10) / 10,
      percentage: Math.round((ms / totalMs) * 1000) / 10,
    }))
    .sort((a, b) => b.hours - a.hours);
}

export function computeDayTrend(blocks: TimeBlock[], days: Date[]): DayTrend[] {
  return days.map((day) => {
    const dayStr = day.toDateString();
    const dayBlocks = blocks.filter((b) => b.start.toDateString() === dayStr);

    const entry: DayTrend = {
      date: `${day.getMonth() + 1}/${day.getDate()}`,
      label: `${day.getMonth() + 1}/${day.getDate()}`,
    };

    const catMap = new Map<CategoryKey, number>();
    for (const b of dayBlocks) {
      const ms = b.end.getTime() - b.start.getTime();
      catMap.set(b.category, (catMap.get(b.category) ?? 0) + ms);
    }

    for (const [cat, ms] of catMap) {
      entry[cat] = Math.round((ms / 3600000) * 10) / 10;
    }

    return entry;
  });
}

export function computeTopActivities(blocks: TimeBlock[], limit = 10): TopActivity[] {
  const map = new Map<string, { category: CategoryKey; totalMs: number; count: number }>();

  for (const b of blocks) {
    const key = `${b.title}__${b.category}`;
    const ms = b.end.getTime() - b.start.getTime();
    const existing = map.get(key);
    if (existing) {
      existing.totalMs += ms;
      existing.count += 1;
    } else {
      map.set(key, { category: b.category, totalMs: ms, count: 1 });
    }
  }

  return Array.from(map.entries())
    .map(([key, val]) => {
      const title = key.split('__')[0];
      return {
        title,
        category: val.category,
        label: CATEGORIES[val.category]?.label ?? val.category,
        color: CATEGORIES[val.category]?.color ?? '#6B7280',
        totalHours: Math.round((val.totalMs / 3600000) * 10) / 10,
        count: val.count,
      };
    })
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, limit);
}

export function getTotalHours(blocks: TimeBlock[]): number {
  return Math.round(
    (blocks.reduce((sum, b) => sum + (b.end.getTime() - b.start.getTime()), 0) / 3600000) * 10
  ) / 10;
}