import HistorySummaryCards from '@/components/history/HistorySummaryCards';
import GrowthProgressSection from '@/components/history/GrowthProgressSection';
import WeeklyTrendChart from '@/components/history/WeeklyTrendChart';
import HistoryRecentPractices from '@/components/history/HistoryRecentPractices';
import { useHistoryList, useHistoryStatistics } from '@/hooks/useHistory';

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-[24px] flex items-center">
      <h2 className="text-[24px] leading-[36px] font-semibold tracking-[-0.48px] text-gray-300">{title}</h2>
      {subtitle && (
        <p className="ml-[24px] text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

function SectionMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-[160px] w-full items-center justify-center rounded-[6px] border border-gray-800 bg-gray-900 text-gray-500">
      {children}
    </div>
  );
}

const STATISTICS_ERROR_MESSAGE = '통계를 불러오지 못했습니다.';

export default function HistoryPage() {
  const { data, isError: isListError } = useHistoryList();
  const { data: statistics, isError: isStatisticsError } = useHistoryStatistics();

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-950 pt-[76px] pb-[100px] text-white">
      {/* 컨텐츠 묶음 */}
      <div className="flex w-[1196px] shrink-0 flex-col">
        {/* 1. 상단 타이틀 및 설명 섹션 */}
        <div className="mb-[80px] flex flex-col items-start gap-[8px] self-stretch">
          <h1 className="heading-medium-b self-stretch tracking-[-0.64px] text-gray-100">연주 히스토리</h1>
          <p className="self-stretch text-[20px] leading-[30px] font-normal tracking-[-0.4px] text-gray-600">
            최근 연주 기록과 흐름을 한눈에 확인해보세요.
          </p>
        </div>

        {/* 2. 이번주 연주 요약 섹션 */}
        <div className="mb-[80px] flex w-[1196px] flex-col">
          <SectionHeader title="이번주 연주 요약" />
          {isStatisticsError ? (
            <SectionMessage>{STATISTICS_ERROR_MESSAGE}</SectionMessage>
          ) : (
            <HistorySummaryCards data={statistics?.weeklySummary} />
          )}
        </div>

        {/* 3. 영역별 성장 변화 섹션 */}
        <div className="mb-[80px] flex w-[1196px] flex-col">
          <SectionHeader title="영역별 성장 변화" subtitle="지난주 대비 영역별 평균 점수 변화를 보여드려요." />
          {isStatisticsError ? (
            <SectionMessage>{STATISTICS_ERROR_MESSAGE}</SectionMessage>
          ) : (
            <GrowthProgressSection data={statistics?.domainGrowth} />
          )}
        </div>

        {/* 4. 최근 4주 학습 추이 섹션 */}
        <div className="mb-[80px] flex w-[1196px] flex-col">
          <SectionHeader title="최근 4주 학습 추이" subtitle="최근 4주간 평균 점수 변화를 보여드려요." />
          {isStatisticsError ? (
            <SectionMessage>{STATISTICS_ERROR_MESSAGE}</SectionMessage>
          ) : (
            <WeeklyTrendChart data={statistics?.weeklyTrend} />
          )}
        </div>

        {/* 5. 최근 연주 리스트 */}
        <div className="flex w-[1196px] flex-col">
          <SectionHeader title="최근 연주" />
          {isListError ? (
            <SectionMessage>연주 기록을 불러오지 못했습니다.</SectionMessage>
          ) : data && data.items.length === 0 ? (
            <SectionMessage>아직 연주 기록이 없습니다.</SectionMessage>
          ) : (
            <HistoryRecentPractices data={data?.items} />
          )}
        </div>
      </div>
    </div>
  );
}
