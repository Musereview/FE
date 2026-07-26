import HistorySummaryCards from '@/components/history/HistorySummaryCards';
import GrowthProgressSection from '@/components/history/GrowthProgressSection';
import WeeklyTrendChart from '@/components/history/WeeklyTrendChart';
import HistoryRecentPractices from '@/components/history/HistoryRecentPractices';

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

export default function HistoryPage() {
  const historyPracticeData = [
    {
      practiceId: 1,
      title: 'Jazz Standard Practice',
      scoreChange: '+8',
      scoreType: 'up' as const,
      description:
        '리디안 스케일 활용이 우수하며, 텐션음 해결이 자연스러웠습니다.\n박자 안정성을 더 개선하면 좋겠습니다.',
      timeLabel: '소요시간 10분',
      date: '오늘',
    },
    {
      practiceId: 2,
      title: 'Modal Interchange Practice',
      scoreChange: '+6',
      scoreType: 'up' as const,
      description: '모달 인터체인지 개념을 잘 적용했으나, 전조 구간에서 약간의 불안정함이 있었습니다.',
      timeLabel: '소요시간 10분',
      date: '어제',
    },
    {
      practiceId: 3,
      title: 'Voice Leading Exercise',
      scoreChange: '-5',
      scoreType: 'down' as const,
      description: '보이스 리딩이 매끄럽지 못했고, 코드 톤 간 연결이 부자연스러웠습니다.\n더 많은 연습이 필요합니다.',
      timeLabel: '소요시간 10분',
      date: '4월 30일',
    },
    {
      practiceId: 4,
      title: 'Blues Scale Improvisation',
      scoreChange: '—',
      scoreType: 'neutral' as const,
      description: '블루스 스케일을 효과적으로 사용했고, 리듬감이 뛰어났습니다.',
      timeLabel: '소요시간 10분',
      date: '4월 29일',
    },
  ];

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
          <HistorySummaryCards />
        </div>

        {/* 3. 영역별 성장 변화 섹션 */}
        <div className="mb-[80px] flex w-[1196px] flex-col">
          <SectionHeader title="영역별 성장 변화" subtitle="지난주 대비 영역별 평균 점수 변화를 보여드려요." />
          <GrowthProgressSection />
        </div>

        {/* 4. 최근 4주 학습 추이 섹션 */}
        <div className="mb-[80px] flex w-[1196px] flex-col">
          <SectionHeader title="최근 4주 학습 추이" subtitle="최근 4주간 평균 점수 변화를 보여드려요." />
          <WeeklyTrendChart />
        </div>

        {/* 5. 최근 연주 리스트 */}
        <div className="flex w-[1196px] flex-col">
          <SectionHeader title="최근 연주" />
          <HistoryRecentPractices data={historyPracticeData} />
        </div>
      </div>
    </div>
  );
}
