import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AttendanceSection from '@/components/main/AttendanceSection';
import LearningBanner from '@/components/main/LearningBanner';
import RecommendedLearnings from '@/components/main/RecommandLearn';
import RecentPractices from '@/components/main/RecentPractices';
import DashboardNoti from '@/components/main/DashboardNoti';
import { fetchDashboardData } from '@/apis/dashboardApi';
import type { NotiItem } from '@/types/notification';
import type { DashboardData } from '@/types/dashboard';

interface LayoutContextType {
  onToggleNotification: () => void;
  notiList: NotiItem[];
  onReadItem: (id: number) => void;
}

export default function MainPage() {
  const { onToggleNotification, notiList, onReadItem } = useOutletContext<LayoutContextType>();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const result = await fetchDashboardData();
        setDashboardData(result);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        setDashboardData({
          attendance: [],
          currentLearning: null,
          recommendedLearnings: [],
          recentPlayings: [],
        } as unknown as DashboardData);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  //로딩 중일 때
  if (isLoading || !dashboardData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white">
        <p className="animate-pulse">로딩 중...</p>
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

          <DashboardNoti data={notiList} onReadItem={onReadItem} />
        </div>
      </div>
    </div>
  );
}
