import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AttendanceSection from '@/components/main/AttendanceSection';
import LearningBanner from '@/components/main/LearningBanner';
import RecommendedLearnings from '@/components/main/RecommandLearn';
import RecentPractices from '@/components/main/RecentPractices';
import DashboardNoti from '@/components/main/DashboardNoti';
import { fetchDashboardData } from '@/apis/home';
import type { NotiItem } from '@/types/notification';

interface LayoutContextType {
  onToggleNotification: () => void;
  notiList: NotiItem[];
  onNotificationClick: (item: NotiItem) => void;
}

export default function MainPage() {
  const { onToggleNotification, notiList, onNotificationClick } = useOutletContext<LayoutContextType>();

  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });

  // 1. 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white">
        <p className="animate-pulse">로딩 중...</p>
      </div>
    );
  }

  // 2. API 에러가 발생했거나 데이터가 없을 때 (재시도 버튼 제공)
  if (isError || !dashboardData) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-950 text-white">
        <p className="text-lg text-gray-300">대시보드 데이터를 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-gray-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-gray-800">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col bg-gray-950 pb-[44px]">
      {/* 1. 상단 출석 현황판 섹션 */}
      <AttendanceSection data={dashboardData} />

      {/* 2. 중간 블록: 진행 중인 학습 / 추천 학습 */}
      <div className="mx-auto mt-[54px] grid w-full max-w-[1400px] grid-cols-2 gap-6 px-10">
        <div className="flex w-full flex-col">
          <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-300">
            진행 중인 학습
          </h3>
          <LearningBanner data={dashboardData.currentLearning} />
        </div>

        <div className="flex w-full flex-col">
          <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-300">
            추천 학습
          </h3>
          <RecommendedLearnings data={dashboardData.recommendedLearnings} />
        </div>
      </div>

      {/* 3. 하단 블록: 최근 연습 / 알림 */}
      <div className="mx-auto mt-[98px] grid w-full max-w-[1400px] grid-cols-2 gap-6 px-10">
        <div className="flex w-full flex-col">
          <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-300">
            최근 연습
          </h3>
          <RecentPractices data={dashboardData.recentPlayings} />
        </div>

        <div className="flex w-full flex-col">
          <div className="mb-3 flex w-full items-center justify-between">
            <h3 className="flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-300">
              알림
            </h3>

            <button
              type="button"
              onClick={onToggleNotification}
              className="cursor-pointer border-none bg-transparent p-0 font-sans text-xs text-gray-500 transition-colors outline-none hover:text-gray-400">
              전체 보기
            </button>
          </div>

          <DashboardNoti data={notiList} onNotificationClick={onNotificationClick} />
        </div>
      </div>
    </div>
  );
}
