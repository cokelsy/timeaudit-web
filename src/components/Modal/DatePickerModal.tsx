import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DatePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  onClear?: () => void;
  selectedDate?: Date | null;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month,1);
  let startWeekday = firstDay.getDay();
  if (startWeekday === 0) startWeekday = 7;
  const daysInMonth = new Date(year, month +1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i =1; i < startWeekday; i++) cells.push(null);
  for (let d =1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getNearestHalfHour(): { hour: number; minute: number } {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const rounded = Math.floor(m / 30) * 30;
  return { hour: h, minute: rounded };
}

export default function DatePickerModal({ open, onClose, onSelect, onClear, selectedDate }: DatePickerModalProps) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeHour, setTimeHour] = useState(getNearestHalfHour().hour);
  const [timeMinute, setTimeMinute] = useState(getNearestHalfHour().minute);

  useEffect(() => {
    if (open) {
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
      setSelectedDay(null);
      setShowTimePicker(false);
      const nearest = getNearestHalfHour();
      setTimeHour(nearest.hour);
      setTimeMinute(nearest.minute);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const monthLabel = `${viewYear}年${viewMonth + 1}月`;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    if (selectedDay == null) return;
    const date = new Date(viewYear, viewMonth, selectedDay, timeHour, timeMinute);
    onSelect(date);
    onClose();
  };

  const handleClear = () => {
    if (onClear) onClear();
    onClose();
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = [0, 30];

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div className="relative bg-white" style={{ maxWidth: 320, width: 'calc(100vw - 32px)', borderRadius: 16, padding: '28px 24px', boxShadow: 'var(--shadow-modal)' }}>
        <h3 className="text-[17px] font-semibold text-text-primary mb-5">选择截止时间</h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-medium text-text-primary">{monthLabel}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-[6px] text-text-tertiary hover:text-text-primary hover:bg-bg-input transition-colors text-[14px]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-[6px] text-text-tertiary hover:text-text-primary hover:bg-bg-input transition-colors text-[14px]"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-[11px] text-text-tertiary text-center font-medium py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 mb-4">
          {calendarDays.map((day, i) => (
            <div key={i} className="flex items-center justify-center h-9">
              {day != null && (
                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`w-8 h-8 rounded-full text-[13px] flex items-center justify-center transition-colors ${
                    selectedDay === day
                      ? 'bg-brand text-white font-medium'
                      : isToday(day)
                        ? 'text-brand font-medium'
                        : 'text-text-primary hover:bg-bg-input'
                  }`}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 mb-4">
          <button
            type="button"
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="flex items-center justify-between w-full text-[13px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              时间
            </span>
            <span className="tabular-nums">
              {showTimePicker ? '收起' : `${String(timeHour).padStart(2, '0')}:${String(timeMinute).padStart(2, '0')}`}
            </span>
          </button>

          {showTimePicker && (
            <div className="mt-2.5 flex items-center gap-2">
              <select
                value={timeHour}
                onChange={(e) => setTimeHour(Number(e.target.value))}
                className="flex-1 h-9 px-2 rounded-[8px] border border-border bg-bg-input text-[13px] text-text-primary focus:outline-none focus:border-brand tabular-nums"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}时</option>
                ))}
              </select>
              <span className="text-[13px] text-text-tertiary">:</span>
              <select
                value={timeMinute}
                onChange={(e) => setTimeMinute(Number(e.target.value))}
                className="flex-1 h-9 px-2 rounded-[8px] border border-border bg-bg-input text-[13px] text-text-primary focus:outline-none focus:border-brand tabular-nums"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}分</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedDate ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-[13px] text-text-tertiary hover:text-danger transition-colors"
            >
              清除日期
            </button>
          ) : (
            <div />
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-text-secondary hover:bg-bg-input transition-colors"
            style={{ padding: '8px 22px', borderRadius: 10 }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedDay == null}
            className="bg-brand text-white font-medium hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ padding: '8px 28px', borderRadius: 10, fontSize: 14 }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}