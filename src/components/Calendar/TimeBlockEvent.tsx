import { CATEGORIES } from '@/utils/constants';
import type { CategoryKey } from '@/utils/constants';

interface TimeBlockEventProps {
  title: string;
  category: CategoryKey;
}

export default function TimeBlockEvent({ title, category }: TimeBlockEventProps) {
  const cat = CATEGORIES[category];
  const color = cat?.color ?? '#6B7280';
  const bgColor = color + '18';

  return (
    <div className="overflow-hidden h-full flex transition-shadow hover:shadow-sm" style={{ backgroundColor: bgColor }}>
      <div
        className="w-[3px] flex-shrink-0 self-stretch"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 px-1.5 min-w-0 flex items-center justify-center">
        <div
          className="text-[11px] font-medium leading-tight truncate"
          style={{ color }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}