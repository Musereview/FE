// src/pages/history/HistoryPage.tsx

import HistorySummaryCards from '@/components/history/HistorySummaryCards';
import GrowthProgressSection from '@/components/history/GrowthProgressSection';
import WeeklyTrendChart from '@/components/history/WeeklyTrendChart';
import HistoryRecentPractices from '@/components/history/HistoryRecentPractices';

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
    <div className="flex min-h-screen w-full justify-center bg-[#090A0F] pt-[76px] pb-[100px] text-white">
      {/* 컨텐츠 묶음  */}
      <div className="flex w-[1196px] shrink-0 flex-col">
        {/* 1. 상단 타이틀 및 설명 섹션 */}
        <div className="mb-[80px] flex flex-col items-start gap-[8px] self-stretch">
          <h1
            className="self-stretch text-[#F0F1F1]"
            style={{
              fontFamily: 'Pretendard',
              fontSize: '32px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '44px',
              letterSpacing: '-0.64px',
            }}>
            연주 히스토리
          </h1>
          <p
            className="self-stretch text-[#868A91]"
            style={{
              fontFamily: 'Pretendard',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '30px',
              letterSpacing: '-0.4px',
            }}>
            최근 연주 기록과 흐름을 한눈에 확인해보세요.
          </p>
        </div>

        {/* 2. 이번주 연주 요약 섹션 */}
        <div className="mb-[80px] flex w-[1196px] flex-col">
          <h2
            className="mb-[24px] text-[#E7E7E8]"
            style={{
              fontFamily: 'Pretendard',
              fontSize: '24px',
              fontWeight: 600,
              lineHeight: '36px',
              letterSpacing: '-0.48px',
            }}>
            이번주 연주 요약
          </h2>
          <HistorySummaryCards />
        </div>

        {/* 3. 영역별 성장 변화 섹션 */}
        <div className="mb-[80px] flex w-[1196px] flex-col">
          <div className="mb-[24px] flex items-center">
            <h2
              className="text-[#E7E7E8]"
              style={{
                fontFamily: 'Pretendard',
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: '36px',
                letterSpacing: '-0.48px',
              }}>
              영역별 성장 변화
            </h2>
            <p
              className="ml-[24px] text-[#AEB1B6]"
              style={{
                fontFamily: 'Pretendard',
                fontSize: '18px',
                fontWeight: 500,
                lineHeight: '30px',
                letterSpacing: '-0.36px',
              }}>
              지난주 대비 영역별 평균 점수 변화를 보여드려요.
            </p>
          </div>
          <GrowthProgressSection />
        </div>

        {/* 4. 최근 4주 학습 추이 섹션 */}
        <div className="mb-[80px] flex w-[1196px] flex-col">
          <div className="mb-[24px] flex items-center">
            <h2
              className="text-[#E7E7E8]"
              style={{
                fontFamily: 'Pretendard',
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: '36px',
                letterSpacing: '-0.48px',
              }}>
              최근 4주 학습 추이
            </h2>
            <p
              className="ml-[24px] text-[#AEB1B6]"
              style={{
                fontFamily: 'Pretendard',
                fontSize: '18px',
                fontWeight: 500,
                lineHeight: '30px',
                letterSpacing: '-0.36px',
              }}>
              최근 4주간 평균 점수 변화를 보여드려요.
            </p>
          </div>
          <WeeklyTrendChart />
        </div>

        {/* 5. 최근 연주 리스트  */}
        <div className="flex w-[1196px] flex-col">
          <h2
            className="mb-[24px] text-[#E7E7E8]"
            style={{
              fontFamily: 'Pretendard',
              fontSize: '24px',
              fontWeight: 600,
              lineHeight: '36px',
              letterSpacing: '-0.48px',
            }}>
            최근 연주
          </h2>
          <HistoryRecentPractices data={historyPracticeData} />
        </div>
      </div>
    </div>
  );
}
