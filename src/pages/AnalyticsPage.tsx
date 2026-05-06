import { useAnalytics } from '@/hooks/useAnalytics';
import RangeSelector from '@/components/Analytics/RangeSelector';
import CategoryPieChart from '@/components/Analytics/CategoryPieChart';
import TrendChart from '@/components/Analytics/TrendChart';
import TopActivities from '@/components/Analytics/TopActivities';

export default function AnalyticsPage() {
  const {
    loading,
    mode,
    categoryStats,
    dayTrend,
    topActivities,
    totalHours,
    formatRangeTitle,
    goPrev,
    goNext,
    goToday,
    switchMode,
  } = useAnalytics();

  return (
    <div className="h-full flex flex-col p-6 gap-5 overflow-y-auto">
      <RangeSelector
        mode={mode}
        title={formatRangeTitle}
        onModeChange={switchMode}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[13px] text-text-secondary">加载中...</div>
        </div>
      ) : totalHours === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <p className="text-[14px] text-text-secondary">该时段暂无时间记录</p>
            <p className="text-[12px] text-text-tertiary mt-1">在日历中添加活动后即可查看数据分析</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-bg-card rounded-[8px] border border-border p-5">
              <h3 className="text-[14px] font-medium text-text-primary mb-4">时间分类占比</h3>
              <div className="h-[200px]">
                <CategoryPieChart data={categoryStats} totalHours={totalHours} />
              </div>
            </div>

            <div className="bg-bg-card rounded-[8px] border border-border p-5">
              <h3 className="text-[14px] font-medium text-text-primary mb-4">时间趋势</h3>
              <div className="h-[200px]">
                <TrendChart data={dayTrend} mode={mode} />
              </div>
            </div>
          </div>

          <div className="bg-bg-card rounded-[8px] border border-border p-5">
            <h3 className="text-[14px] font-medium text-text-primary mb-4">活动排行</h3>
            <TopActivities data={topActivities} />
          </div>
        </>
      )}
    </div>
  );
}