import type { RangeMode } from '@/hooks/useAnalytics';

interface RangeSelectorProps {
  mode: RangeMode;
  title: string;
  onModeChange: (mode: RangeMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function RangeSelector({
  mode,
  title,
  onModeChange,
  onPrev,
  onNext,
  onToday,
}: RangeSelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center bg-bg-input rounded-[10px]">
        <button
          onClick={() => onModeChange('week')}
          className="font-medium transition-colors"
          style={{
            padding: '8px 18px',
            fontSize: '13px',
            borderRadius: '10px 0 0 10px',
            backgroundColor: mode === 'week' ? 'var(--color-brand)' : 'transparent',
            color: mode === 'week' ? '#fff' : 'var(--color-text-secondary)',
          }}
        >
          周
        </button>
        <div className="w-px h-5 bg-border" />
        <button
          onClick={() => onModeChange('month')}
          className="font-medium transition-colors"
          style={{
            padding: '8px 18px',
            fontSize: '13px',
            borderRadius: '0 10px 10px 0',
            backgroundColor: mode === 'month' ? 'var(--color-brand)' : 'transparent',
            color: mode === 'month' ? '#fff' : 'var(--color-text-secondary)',
          }}
        >
          月
        </button>
      </div>

      <h2 className="text-[17px] font-semibold text-text-primary tracking-tight">{title}</h2>

      <div className="flex items-center gap-3">
        <button
          onClick={onToday}
          className="font-medium text-text-primary border border-border hover:bg-bg-input transition-colors"
          style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
        >
          今天
        </button>
        <div className="flex items-center bg-bg-input rounded-[10px]">
          <button
            onClick={onPrev}
            className="text-text-secondary hover:text-text-primary transition-colors"
            style={{ padding: '8px 12px', fontSize: '16px', borderRadius: '10px 0 0 10px' }}
          >
            ‹
          </button>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={onNext}
            className="text-text-secondary hover:text-text-primary transition-colors"
            style={{ padding: '8px 12px', fontSize: '16px', borderRadius: '0 10px 10px 0' }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}