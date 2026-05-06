import type { TopActivity } from '@/utils/analyticsUtils';

interface TopActivitiesProps {
  data: TopActivity[];
}

export default function TopActivities({ data }: TopActivitiesProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[13px] text-text-tertiary">暂无数据</p>
      </div>
    );
  }

  const maxHours = data[0]?.totalHours ?? 1;

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const barWidth = (item.totalHours / maxHours) * 100;
        return (
          <div key={`${item.title}-${item.category}-${index}`} className="group">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] text-text-tertiary w-5 text-right tabular-nums">
                {index + 1}
              </span>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[13px] text-text-primary flex-1 truncate">{item.title}</span>
              <span className="text-[12px] text-text-secondary tabular-nums">{item.totalHours}h</span>
              <span className="text-[11px] text-text-tertiary tabular-nums">×{item.count}</span>
            </div>
            <div className="ml-7 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${barWidth}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}