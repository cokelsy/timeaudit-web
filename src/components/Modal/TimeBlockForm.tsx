import { useState, useRef, useCallback, useEffect } from 'react';
import { CATEGORY_OPTIONS, CATEGORIES } from '@/utils/constants';
import type { CategoryKey } from '@/utils/constants';
import type { TimeBlockFormData, TimeBlock } from '@/services/timeBlockService';

interface TimeBlockFormProps {
  open: boolean;
  initialData?: Partial<TimeBlockFormData & { id?: string }>;
  existingBlocks?: TimeBlock[];
  onSubmit: (data: TimeBlockFormData) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const MINUTES_IN_DAY = 1440;
const MIN_DURATION = 15;
const SNAP = 5;

function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function minutesToTimeStr(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function durationStr(startMin: number, endMin: number): string {
  const diff = endMin - startMin;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m} 分钟`;
  if (m === 0) return `${h} 小时`;
  return `${h} 小时 ${m} 分钟`;
}

function snapMinutes(m: number): number {
  return Math.round(m / SNAP) * SNAP;
}

export default function TimeBlockForm({
  open,
  initialData,
  existingBlocks = [],
  onSubmit,
  onDelete,
  onCancel,
}: TimeBlockFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryKey>('study');
  const [startMin, setStartMin] = useState(540);
  const [endMin, setEndMin] = useState(600);
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [error, setError] = useState('');

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'start' | 'end' | null>(null);

  useEffect(() => {
    if (!open || !initialData) return;
    setTitle(initialData.title ?? '');
    setCategory(initialData.category ?? 'study');

    if (initialData.start) {
      const d = new Date(initialData.start);
      setBaseDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      setStartMin(snapMinutes(dateToMinutes(d)));
    } else {
      setBaseDate(new Date());
      setStartMin(540);
    }

    if (initialData.end) {
      setEndMin(snapMinutes(dateToMinutes(new Date(initialData.end))));
    } else {
      setEndMin(snapMinutes(dateToMinutes(initialData.start ?? new Date()) + 60));
    }

    setError('');
  }, [open, initialData]);

  const buildDate = useCallback(
    (minutes: number): Date => {
      const d = new Date(baseDate);
      d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
      return d;
    },
    [baseDate]
  );

  const getMinutesFromX = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snapMinutes(Math.round(ratio * MINUTES_IN_DAY));
  }, []);

  const clampAwayFromBlocks = useCallback(
    (minutes: number, handle: 'start' | 'end', currentStart: number, currentEnd: number): number => {
      let result = minutes;
      for (const block of existingBlocks) {
        if (block.id === initialData?.id) continue;
        const bStart = dateToMinutes(block.start);
        const bEnd = dateToMinutes(block.end);
        if (handle === 'start') {
          if (result >= bStart && result < bEnd) {
            result = currentStart >= bEnd ? Math.max(result, bEnd) : Math.min(result, bStart);
          }
        } else {
          if (result > bStart && result <= bEnd) {
            result = currentEnd <= bStart ? Math.min(result, bStart) : Math.max(result, bEnd);
          }
        }
      }
      return result;
    },
    [existingBlocks, initialData]
  );

  const handlePointerDown = useCallback(
    (handle: 'start' | 'end', e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = handle;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const m = getMinutesFromX(e.clientX);
      if (dragging.current === 'start') {
        const clamped = clampAwayFromBlocks(m, 'start', startMin, endMin);
        setStartMin(Math.max(0, Math.min(clamped, endMin - MIN_DURATION)));
      } else {
        const clamped = clampAwayFromBlocks(m, 'end', startMin, endMin);
        setEndMin(Math.min(MINUTES_IN_DAY, Math.max(clamped, startMin + MIN_DURATION)));
      }
    },
    [endMin, startMin, getMinutesFromX, clampAwayFromBlocks]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging.current) return;
      const m = getMinutesFromX(e.clientX);
      const distToStart = Math.abs(m - startMin);
      const distToEnd = Math.abs(m - endMin);
      if (distToStart <= distToEnd) {
        setStartMin(Math.max(0, Math.min(m, endMin - MIN_DURATION)));
      } else {
        setEndMin(Math.min(MINUTES_IN_DAY, Math.max(m, startMin + MIN_DURATION)));
      }
    },
    [startMin, endMin, getMinutesFromX]
  );

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入活动名称');
      return;
    }

    if (endMin <= startMin) {
      setError('结束时间必须晚于开始时间');
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      start: buildDate(startMin),
      end: buildDate(endMin),
    });
  };

  const isEdit = !!initialData?.id;
  const startPct = (startMin / MINUTES_IN_DAY) * 100;
  const endPct = (endMin / MINUTES_IN_DAY) * 100;

  const formatDateStr = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日`;
  };

  const ticks = Array.from({ length: 25 }, (_, i) => i);

  const editId = initialData?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white w-full mx-4" style={{ maxWidth: 460, borderRadius: 16, padding: '36px 32px', boxShadow: 'var(--shadow-modal)' }}>
        <h3 className="text-[17px] font-semibold text-text-primary mb-6">
          {isEdit ? '编辑活动' : '新建活动'}
        </h3>

        {error && (
          <div className="mb-5 p-3 rounded-[10px] bg-danger/8 text-danger text-[13px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">活动名称</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] border border-border bg-bg-input text-text-primary text-[14px] placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
              placeholder="输入活动名称"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1.5">分类</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((opt) => {
                const isActive = category === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className="flex items-center border transition-all"
                    style={{
                      borderColor: isActive ? opt.color : 'var(--color-border)',
                      backgroundColor: isActive ? opt.color + '12' : 'transparent',
                      color: isActive ? opt.color : 'var(--color-text-secondary)',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      gap: 6,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium text-text-secondary">时间</label>
              <span className="text-[11px] text-text-tertiary">{formatDateStr(baseDate)}</span>
            </div>

            <div className="text-center mb-3">
              <span className="text-[16px] font-semibold text-text-primary tabular-nums">
                {minutesToTimeStr(startMin)} – {minutesToTimeStr(endMin)}
              </span>
              <span className="text-[12px] text-text-tertiary ml-2">
                共 {durationStr(startMin, endMin)}
              </span>
            </div>

            <div
              ref={trackRef}
              className="relative h-10 select-none touch-none cursor-pointer"
              onClick={handleTrackClick}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[6px] rounded-full bg-bg-input" />

              {existingBlocks
                .filter((b) => b.id !== editId)
                .map((block) => {
                  const bStart = dateToMinutes(block.start);
                  const bEnd = dateToMinutes(block.end);
                  const bLeft = (bStart / MINUTES_IN_DAY) * 100;
                  const bWidth = ((bEnd - bStart) / MINUTES_IN_DAY) * 100;
                  const catColor = CATEGORIES[block.category]?.color ?? '#6B7280';
                  return (
                    <div
                      key={block.id}
                      className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full pointer-events-none"
                      style={{
                        left: `${bLeft}%`,
                        width: `${bWidth}%`,
                        backgroundColor: catColor,
                        opacity: 0.3,
                      }}
                    />
                  );
                })}

              <div
                className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-brand/20"
                style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
              />

              <div
                className="absolute top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white border-2 border-brand cursor-grab active:cursor-grabbing z-10 -translate-x-1/2 transition-shadow hover:shadow-md"
                style={{ left: `${startPct}%` }}
                onPointerDown={(e) => handlePointerDown('start', e)}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[4px] h-[6px] rounded-[1px] bg-brand/40" />
              </div>

              <div
                className="absolute top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white border-2 border-brand cursor-grab active:cursor-grabbing z-10 -translate-x-1/2 transition-shadow hover:shadow-md"
                style={{ left: `${endPct}%` }}
                onPointerDown={(e) => handlePointerDown('end', e)}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[4px] h-[6px] rounded-[1px] bg-brand/40" />
              </div>
            </div>

            <div className="relative h-4 mt-0.5">
              {ticks.filter((t) => t % 3 === 0).map((t) => (
                <span
                  key={t}
                  className="absolute text-[9px] text-text-tertiary -translate-x-1/2 tabular-nums"
                  style={{ left: `${(t / 24) * 100}%` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="text-danger border border-danger/20 hover:bg-danger/6 transition-colors"
                style={{ padding: '8px 18px', borderRadius: 10, fontSize: 14 }}
              >
                删除
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onCancel}
              className="text-text-secondary hover:bg-bg-input transition-colors"
              style={{ padding: '8px 22px', borderRadius: 10, fontSize: 14 }}
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-brand text-white font-medium hover:bg-brand-hover transition-colors"
              style={{ padding: '8px 28px', borderRadius: 10, fontSize: 14 }}
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}