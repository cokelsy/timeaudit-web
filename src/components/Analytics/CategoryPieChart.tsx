import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryStat } from '@/utils/analyticsUtils';

interface CategoryPieChartProps {
  data: CategoryStat[];
  totalHours: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as CategoryStat;
  return (
    <div className="bg-white rounded-[8px] shadow-lg border border-border px-3 py-2 text-[12px]">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
        <span className="font-medium text-text-primary">{d.label}</span>
      </div>
      <div className="text-text-secondary">
        {d.hours} 小时 · {d.percentage}%
      </div>
    </div>
  );
}

export default function CategoryPieChart({ data, totalHours }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[13px] text-text-tertiary">暂无数据</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.label,
    value: d.hours,
    ...d,
  }));

  return (
    <div className="flex items-center gap-4 h-full">
      <div className="w-[180px] h-[180px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="text-[12px] text-text-tertiary mb-1">
          共 {totalHours} 小时
        </div>
        {data.map((d) => (
          <div key={d.category} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[12px] text-text-primary flex-1 truncate">{d.label}</span>
            <span className="text-[12px] text-text-secondary tabular-nums">{d.hours}h</span>
            <span className="text-[11px] text-text-tertiary tabular-nums w-10 text-right">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}