import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTimeBlocksByRange, createTimeBlock, updateTimeBlock, deleteTimeBlock, type TimeBlock, type TimeBlockFormData } from '@/services/timeBlockService';
import { getWeekStart, getWeekEnd } from '@/utils/timeUtils';

export function useTimeBlocks() {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));

  const fetchBlocks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const weekEnd = getWeekEnd(weekStart);
      const data = await getTimeBlocksByRange(user.uid, weekStart, weekEnd);
      setBlocks(data);
    } catch (err) {
      console.error('Failed to fetch time blocks:', err);
    } finally {
      setLoading(false);
    }
  }, [user, weekStart]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const add = async (data: TimeBlockFormData) => {
    if (!user) return;
    const block = await createTimeBlock(user.uid, data);
    setBlocks((prev) => [...prev, block]);
    return block;
  };

  const update = async (id: string, data: Partial<TimeBlockFormData>) => {
    await updateTimeBlock(id, data);
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        return { ...b, ...data, start: data.start ?? b.start, end: data.end ?? b.end };
      })
    );
  };

  const remove = async (id: string) => {
    await deleteTimeBlock(id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const goToWeek = (date: Date) => {
    setWeekStart(getWeekStart(date));
  };

  return { blocks, loading, weekStart, add, update, remove, goToWeek, refetch: fetchBlocks };
}