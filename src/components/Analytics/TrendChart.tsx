import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CATEGORIES, type CategoryKey } from '@/utils/constants';
import type { DayTrend } from '@/utils/analyticsUtils';

interface TrendChartProps {
  data: DayTrend[];
  mode: 'week' | 'month';
}

const VISIBLE_CATEGORIES: CategoryKey[] = ['study', 'work', 'life', 'entertainment', 'sports', 'sleep'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-[8px] shadow-lg border border-border px-3 py-2 text-[12px]">
      <div className="font-medium text-text-primary mb-1">{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary">
            {CATEGORIES[entry.dataKey as CategoryKey]?.label ?? entry.dataKey}: {entry.value}h
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TrendChart({ data, mode }: TrendChartProps) {
  if (data.length === 0 || data.every((d) => Object.keys(d).length <= 2)) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[13px] text-text-tertiary">暂无数据</p>
      </div>
    );
  }

  const activeCategories = VISIBLE_CATEGORIES.filter((cat) =>
    data.some((d) => (d[cat] as number) > 0)
  );

  const tickInterval = mode === 'month' ? Math.ceil(data.length / 7) : 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={1} barSize={mode === 'week' ? 12 : 6}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={{ stroke: '#E5E7EB' }}
          tickLine={false}
          interval={tickInterval}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          unit="h"
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => CATEGORIES[value as CategoryKey]?.label ?? value}
          wrapperStyle={{ fontSize: 12 }}
        />
        {activeCategories.map((cat) => (
          <Bar
            key={cat}
            dataKey={cat}
            stackId="stack"
            fill={CATEGORIES[cat].color}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}