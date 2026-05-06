import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTimeBlocksByRange, type TimeBlock } from '@/services/timeBlockService';
import { getWeekStart, getWeekEnd } from '@/utils/timeUtils';
import { computeCategoryStats, computeDayTrend, computeTopActivities, getTotalHours } from '@/utils/analyticsUtils';

export type RangeMode = 'week' | 'month';

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const d = new Date(start);
  while (d < end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function useAnalytics() {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<RangeMode>('week');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  const rangeStart = useMemo(() => {
    return mode === 'week' ? getWeekStart(referenceDate) : getMonthStart(referenceDate);
  }, [mode, referenceDate]);

  const rangeEnd = useMemo(() => {
    return mode === 'week' ? getWeekEnd(rangeStart) : getMonthEnd(referenceDate);
  }, [mode, referenceDate, rangeStart]);

  const days = useMemo(() => getDaysInRange(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const fetchBlocks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTimeBlocksByRange(user.uid, rangeStart, rangeEnd);
      setBlocks(data);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, rangeStart, rangeEnd]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const categoryStats = useMemo(() => computeCategoryStats(blocks), [blocks]);
  const dayTrend = useMemo(() => computeDayTrend(blocks, days), [blocks, days]);
  const topActivities = useMemo(() => computeTopActivities(blocks), [blocks]);
  const totalHours = useMemo(() => getTotalHours(blocks), [blocks]);

  const goPrev = useCallback(() => {
    setReferenceDate((prev) => {
      const d = new Date(prev);
      if (mode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  }, [mode]);

  const goNext = useCallback(() => {
    setReferenceDate((prev) => {
      const d = new Date(prev);
      if (mode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  }, [mode]);

  const goToday = useCallback(() => {
    setReferenceDate(new Date());
  }, []);

  const switchMode = useCallback((newMode: RangeMode) => {
    setMode(newMode);
    setReferenceDate(new Date());
  }, []);

  const formatRangeTitle = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const s = rangeStart;
    const e = new Date(rangeEnd.getTime() - 1);
    if (mode === 'week') {
      return `${s.getFullYear()}年${pad(s.getMonth() + 1)}月${pad(s.getDate())}日 – ${pad(e.getMonth() + 1)}月${pad(e.getDate())}日`;
    }
    return `${s.getFullYear()}年${pad(s.getMonth() + 1)}月`;
  }, [mode, rangeStart, rangeEnd]);

  return {
    loading,
    blocks,
    mode,
    categoryStats,
    dayTrend,
    topActivities,
    totalHours,
    rangeStart,
    rangeEnd,
    formatRangeTitle,
    goPrev,
    goNext,
    goToday,
    switchMode,
    refetch: fetchBlocks,
  };
}