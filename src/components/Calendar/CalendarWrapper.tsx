import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useTodos } from '@/hooks/useTodos';
import { useAuth } from '@/contexts/AuthContext';
import { findOverlappingBlock } from '@/services/timeBlockService';
import type { Todo } from '@/services/todoService';
import type { TimeBlockFormData } from '@/services/timeBlockService';
import { getWeekEnd } from '@/utils/timeUtils';
import { computeBlockLayout } from '@/utils/blockLayout';
import TimeBlockEvent from './TimeBlockEvent';
import TimeBlockForm from '@/components/Modal/TimeBlockForm';
import OverlapAlertModal from './OverlapAlertModal';
import TodoDetailModal from '@/components/Modal/TodoDetailModal';

const SNAP_MINUTES = 5;
const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DISPLAY_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

function getDaysOfWeek(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function dateToMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTitle(weekStart: Date): string {
  const y = weekStart.getFullYear();
  const m = weekStart.getMonth() + 1;
  const d = weekStart.getDate();
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const em = end.getMonth() + 1;
  const ed = end.getDate();
  return `${y}年${m}月${d}日 – ${em}月${ed}日`;
}

export default function CalendarWrapper() {
  const { user } = useAuth();
  const { blocks, loading, weekStart, goToWeek, add, update, remove } = useTimeBlocks();
  const { todos: allTodos, remove: removeTodo } = useTodos();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<TimeBlockFormData & { id?: string }>>();
  const [formDate, setFormDate] = useState<Date | null>(null);

  const [overlapOpen, setOverlapOpen] = useState(false);
  const [overlapBlockId, setOverlapBlockId] = useState<string | null>(null);
  const [overlapTitle, setOverlapTitle] = useState('');
  const [_pendingFormData, setPendingFormData] = useState<TimeBlockFormData | null>(null);

  const [todoDetailOpen, setTodoDetailOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const [nowTop, setNowTop] = useState<number | null>(null);
  const gridBodyRef = useRef<HTMLDivElement>(null);

  const HOUR_HEIGHT = 42;

  function minutesToY(minutes: number): number {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    let y = 0;
    for (const dh of DISPLAY_HOURS) {
      if (dh === h) {
        y += (m / 60) * HOUR_HEIGHT;
        break;
      }
      y += HOUR_HEIGHT;
    }
    return y;
  }

  function yToMinutes(y: number): number {
    let remaining = y;
    for (const dh of DISPLAY_HOURS) {
      if (remaining <= HOUR_HEIGHT) {
        return dh * 60 + (remaining / HOUR_HEIGHT) * 60;
      }
      remaining -= HOUR_HEIGHT;
    }
    return DISPLAY_HOURS[DISPLAY_HOURS.length - 1] * 60 + 60;
  }

  const days = useMemo(() => getDaysOfWeek(weekStart), [weekStart]);
  const currentTitle = useMemo(() => formatTitle(weekStart), [weekStart]);

  const deadlineTodos = useMemo(() => {
    const weekEnd = getWeekEnd(weekStart);
    return allTodos.filter(
      (t) => !t.completed && t.deadline && t.deadline >= weekStart && t.deadline < weekEnd
    );
  }, [allTodos, weekStart]);

  const blocksByDay = useMemo(() => {
    const map = new Map<string, typeof blocks>();
    days.forEach((d) => {
      const key = d.toDateString();
      map.set(key, blocks.filter((b) => isSameDay(b.start, d)));
    });
    return map;
  }, [blocks, days]);

  const todosByDay = useMemo(() => {
    const map = new Map<string, Todo[]>();
    days.forEach((d) => {
      const key = d.toDateString();
      map.set(key, deadlineTodos.filter((t) => t.deadline && isSameDay(t.deadline, d)));
    });
    return map;
  }, [deadlineTodos, days]);

  const handlePrev = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    goToWeek(d);
  };
  const handleNext = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    goToWeek(d);
  };
  const handleToday = () => goToWeek(new Date());

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      setNowTop(minutesToY(mins));
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [HOUR_HEIGHT]);

  const handleGridClick = useCallback(
    (dayIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const rawMinutes = yToMinutes(y);
      const snapped = Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES;
      const clamped = Math.max(0, Math.min(1435, snapped));

      const day = days[dayIndex];
      const start = new Date(day);
      start.setHours(Math.floor(clamped / 60), clamped % 60, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      setEditId(null);
      setInitialFormData({ start, end });
      setFormDate(day);
      setFormOpen(true);
    },
    [days]
  );

  const handleBlockClick = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;
      setEditId(block.id);
      setInitialFormData({
        id: block.id,
        title: block.title,
        category: block.category,
        start: block.start,
        end: block.end,
      });
      setFormDate(block.start);
      setFormOpen(true);
    },
    [blocks]
  );

  const handleTodoClick = useCallback(
    (todo: Todo, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedTodo(todo);
      setTodoDetailOpen(true);
    },
    []
  );

  const handleFormSubmit = async (data: TimeBlockFormData) => {
    if (!user) return;
    try {
      if (editId) {
        await update(editId, data);
        closeForm();
      } else {
        const overlapping = await findOverlappingBlock(user.uid, data.start, data.end);
        if (overlapping) {
          setOverlapOpen(true);
          setOverlapBlockId(overlapping.id);
          setOverlapTitle(overlapping.title);
          setPendingFormData(data);
          return;
        }
        await add(data);
        closeForm();
      }
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败，请检查网络连接后重试');
    }
  };

  const handleOverlapEdit = () => {
    setOverlapOpen(false);
    if (overlapBlockId) {
      const block = blocks.find((b) => b.id === overlapBlockId);
      if (block) {
        setEditId(block.id);
        setInitialFormData({
          id: block.id,
          title: block.title,
          category: block.category,
          start: block.start,
          end: block.end,
        });
        setFormOpen(true);
      }
    }
    setPendingFormData(null);
  };

  const handleOverlapCancel = () => {
    setOverlapOpen(false);
    setOverlapBlockId(null);
    setOverlapTitle('');
    setPendingFormData(null);
    closeForm();
  };

  const handleDelete = async () => {
    if (editId) {
      await remove(editId);
      closeForm();
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditId(null);
    setInitialFormData(undefined);
    setFormDate(null);
    setPendingFormData(null);
  };

  const today = new Date();
  const isCurrentWeek = days.some((d) => isSameDay(d, today));

  const formDayBlocks = useMemo(() => {
    if (!formDate) return [];
    const key = formDate.toDateString();
    return blocksByDay.get(key) ?? [];
  }, [formDate, blocksByDay]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-[17px] font-semibold text-text-primary tracking-tight">{currentTitle}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="font-medium text-text-primary border border-border hover:bg-bg-input transition-colors"
            style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
          >
            今天
          </button>
          <div className="flex items-center bg-bg-input rounded-[10px]">
            <button
              onClick={handlePrev}
              className="text-text-secondary hover:text-text-primary transition-colors"
              style={{ padding: '8px 12px', fontSize: '16px', borderRadius: '10px 0 0 10px' }}
            >
              ‹
            </button>
            <div className="w-px h-5 bg-border" />
            <button
              onClick={handleNext}
              className="text-text-secondary hover:text-text-primary transition-colors"
              style={{ padding: '8px 12px', fontSize: '16px', borderRadius: '0 10px 10px 0' }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 relative min-h-0">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-[12px]">
            <div className="text-[13px] text-text-secondary">加载中...</div>
          </div>
        )}

        <div className="h-full overflow-hidden bg-white flex flex-col rounded-[12px]" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div ref={gridBodyRef} className="flex-1 min-h-0 overflow-auto">
            <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border bg-bg-input/50 sticky top-0 z-10 flex-shrink-0">
              <div className="border-r border-border" />
              {days.map((d, i) => {
                const isToday = isSameDay(d, today);
                return (
                  <div
                    key={i}
                    className={`py-2.5 text-center border-r border-border last:border-r-0 transition-colors ${
                      isToday ? 'bg-brand/6' : ''
                    }`}
                  >
                    <div className={`text-[11px] font-medium ${isToday ? 'text-brand' : 'text-text-tertiary'}`}>{DAYS[i]}</div>
                    <div className={`text-[15px] ${isToday ? 'text-brand font-bold' : 'text-text-primary font-medium'}`}>
                      {isToday ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand text-white">
                          {d.getDate()}
                        </span>
                      ) : d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-[48px_repeat(7,1fr)]" style={{ height: DISPLAY_HOURS.length * HOUR_HEIGHT }}>
              <div className="border-r border-border">
                {DISPLAY_HOURS.map((h) => (
                  <div
                    key={h}
                    className="text-[10px] text-text-tertiary text-right pr-2 border-b border-border/60"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {`${String(h).padStart(2, '0')}:00`}
                  </div>
                ))}
              </div>

              {days.map((d, dayIndex) => {
                const key = d.toDateString();
                const dayBlocks = blocksByDay.get(key) ?? [];
                const dayTodos = todosByDay.get(key) ?? [];
                const isToday = isSameDay(d, today);

                return (
                  <div
                    key={dayIndex}
                    className={`relative border-r border-border/60 last:border-r-0 ${isToday ? 'bg-brand/3' : ''}`}
                    onClick={(e) => handleGridClick(dayIndex, e)}
                  >
                    {DISPLAY_HOURS.map((h) => (
                      <div
                        key={h}
                        className="border-b border-border/40"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {(() => {
                      const layout = computeBlockLayout(
                        dayBlocks.map((b) => ({
                          id: b.id,
                          startMs: b.start.getTime(),
                          endMs: b.end.getTime(),
                        }))
                      );
                      return dayBlocks.map((block) => {
                        const startMin = dateToMinutes(block.start);
                        const endMin = dateToMinutes(block.end);
                        const topPx = minutesToY(startMin);
                        const heightPx = minutesToY(endMin) - topPx;
                        const pos = layout.get(block.id);
                        const colIndex = pos?.columnIndex ?? 0;
                        const totalCols = pos?.totalColumns ?? 1;
                        const gapPx = totalCols > 1 ? 2 : 0;
                        return (
                          <div
                            key={block.id}
                            className="absolute cursor-pointer z-[2] px-[1px]"
                            style={{
                              top: topPx,
                              height: Math.max(heightPx, 20),
                              left: `calc(${(colIndex / totalCols) * 100}% + ${gapPx}px)`,
                              width: `calc(${(1 / totalCols) * 100}% - ${gapPx * 2}px)`,
                            }}
                            onClick={(e) => handleBlockClick(block.id, e)}
                          >
                            <TimeBlockEvent title={block.title} category={block.category} />
                          </div>
                        );
                      });
                    })()}

                    {dayTodos.map((todo) => {
                      if (!todo.deadline) return null;
                      const dMin = dateToMinutes(todo.deadline);
                      const topPx = minutesToY(dMin);
                      return (
                        <div
                          key={`todo-${todo.id}`}
                          className="absolute left-0 right-0 cursor-pointer z-[2]"
                          style={{ top: topPx, minHeight: 22 }}
                          onClick={(e) => handleTodoClick(todo, e)}
                        >
                          <div className="overflow-hidden h-full flex" style={{ backgroundColor: '#FEF3C7' }}>
                            <div className="w-[3px] flex-shrink-0 self-stretch" style={{ backgroundColor: '#D97706' }} />
                            <div className="flex-1 px-1.5 py-0.5 min-w-0">
                              <div className="text-[11px] font-medium leading-tight truncate flex items-center gap-1" style={{ color: '#D97706' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {todo.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isToday && isCurrentWeek && nowTop !== null && (
                      <div
                        className="absolute left-0 right-0 z-[3] pointer-events-none"
                        style={{ top: nowTop }}
                      >
                        <div className="h-[1.5px] bg-brand w-full" />
                        <div className="absolute -left-[5px] -top-[4px] w-0 h-0 border-t-[5px] border-b-[5px] border-l-[6px] border-transparent border-l-brand" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <TimeBlockForm
        open={formOpen}
        initialData={initialFormData}
        existingBlocks={formDayBlocks}
        onSubmit={handleFormSubmit}
        onDelete={editId ? handleDelete : undefined}
        onCancel={closeForm}
      />

      <OverlapAlertModal
        open={overlapOpen}
        overlappingTitle={overlapTitle}
        onEdit={handleOverlapEdit}
        onCancel={handleOverlapCancel}
      />

      <TodoDetailModal
        open={todoDetailOpen}
        todo={selectedTodo}
        onClose={() => {
          setTodoDetailOpen(false);
          setSelectedTodo(null);
        }}
        onDelete={(id) => {
          removeTodo(id);
          setTodoDetailOpen(false);
          setSelectedTodo(null);
        }}
      />
    </div>
  );
}