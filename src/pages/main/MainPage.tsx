// src/pages/main/MainPage.tsx
import AttendanceSection from './components/AttendanceSection';
import LearningBanner from './components/LearningBanner';
import RecommendedLearnings from './components/RecommandLearn';
import RecentPractices from './components/RecentPractices';
import DashboardNoti from './components/DashboardNoti';

export default function MainPage() {
  const mockDashboardData = {
    user: { nickname: '김뮤즈' },
    streak: {
      currentDays: 4,
      message: '4일 연속 학습 중이에요!',
      weeklyAttendance: [
        { dayOfWeek: 'MON', label: '월', status: 'COMPLETED' },
        { dayOfWeek: 'TUE', label: '화', status: 'EMPTY' },
        { dayOfWeek: 'WED', label: '수', status: 'COMPLETED' },
        { dayOfWeek: 'THU', label: '목', status: 'TODAY_COMPLETED' },
        { dayOfWeek: 'FRI', label: '금', status: 'EMPTY' },
        { dayOfWeek: 'SAT', label: '토', status: 'EMPTY' },
        { dayOfWeek: 'SUN', label: '일', status: 'EMPTY' },
      ],
    },
    practiceSummary: { weeklyPracticeHours: 21, monthlyPracticeHours: 60, monthLabel: '6월' },
    currentLearning: {
      learningId: 5,
      title: 'Tension Notes',
      subtitle: '11th 텐션 노트 활용하기',
      level: 'ADVANCED',
      progressRate: 10,
    },
    recommendedLearnings: [
      {
        learningId: 1,
        title: 'Lydian Scale',
        level: 'ADVANCED',
        description: '밝고 몽환적인 색채를 가진 모드.\n#4도 음정이 특징입니다.',
      },
      {
        learningId: 2,
        title: 'Pentatonic Scale',
        level: 'INTERMEDIATE',
        description: '5음 음계로 블루스, 록, 팝에서\n광범위하게 사용됩니다.',
      },
    ],
    recentPractices: [
      {
        practiceId: 101,
        title: 'Jazz Standard Practice',
        genre: 'JAZZ',
        keySignature: 'C Major',
        bpm: 120,
        timeLabel: '오늘 · 12분',
      },
      {
        practiceId: 102,
        title: 'Modal Interchange Practice',
        genre: 'JAZZ',
        keySignature: 'C Major',
        bpm: 120,
        timeLabel: '어제 · 15분',
      },
      {
        practiceId: 103,
        title: 'Voice Leading Exercise',
        genre: 'JAZZ',
        keySignature: 'C Major',
        bpm: 120,
        timeLabel: '4월 30일 · 10분',
      },
      {
        practiceId: 104,
        title: 'Blues Scale Improvisation',
        genre: 'JAZZ',
        keySignature: 'C Major',
        bpm: 120,
        timeLabel: '4월 29일 · 8분',
      },
    ],
    notifications: [
      { notiId: 1, title: 'Jazz Standard Practice', timeLabel: '방금 전', isRead: false },
      { notiId: 2, title: 'Modal Interchange Practice', timeLabel: '어제 · 확인', isRead: true },
      { notiId: 3, title: 'Voice Leading Exercise', timeLabel: '4월 30일 · 확인', isRead: true },
      { notiId: 4, title: 'Blues Scale Improvisation', timeLabel: '4월 29일 · 확인', isRead: true },
    ],
  };

  return (
    <div className="flex w-full flex-col bg-[#090A0F] pb-[44px]">
      {/* 1. 상단 출석 현황판 섹션 */}
      <AttendanceSection data={mockDashboardData} />

      {/*  2. 중간 블록: 진행 중인 학습 / 추천 학습*/}
      <div className="mt-[54px] grid w-full grid-cols-2 gap-4 px-[160px]">
        <div className="flex w-full flex-col">
          <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
            진행 중인 학습
          </h3>
          <LearningBanner data={mockDashboardData.currentLearning} />
        </div>

        <div className="flex w-full flex-col">
          <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
            추천 학습
          </h3>
          <RecommendedLearnings data={mockDashboardData.recommendedLearnings} />
        </div>
      </div>

      {/*  3. 하단 블록: 최근 연습 / 알림 */}
      <div className="mt-[98px] grid w-full grid-cols-2 gap-4 px-[160px]">
        <div className="flex w-full flex-col">
          <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
            최근 연습
          </h3>
          <RecentPractices data={mockDashboardData.recentPractices} />
        </div>

        <div className="flex w-full flex-col">
          <div className="mb-3 flex w-full items-center justify-between">
            <h3 className="flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
              알림
            </h3>
            <span className="cursor-pointer font-sans text-xs text-gray-500 transition-colors hover:text-gray-400">
              전체 보기
            </span>
          </div>
          <DashboardNoti data={mockDashboardData.notifications} />
        </div>
      </div>
    </div>
  );
}
