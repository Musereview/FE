// 메인 페이지 - 대시보드 홈 화면
// function MainPage() {
//   return <h1 className="text-2xl font-bold">메인</h1>;
// }

// export default MainPage;
// src/pages/main/MainPage.tsx 예시
import AttendanceSection from './components/AttendanceSection';
import LearningBanner from './components/LearningBanner';
import RecommendedLearnings from './components/RecommandLearn';

export default function MainPage() {
  // 백엔드 명세서에서 준 데이터를 그대로 변수로 선언 (테스트용)
  const mockDashboardData = {
    user: {
      nickname: '김뮤즈',
      profileImgUrl: 'https://cdn.example.com/profile/1.png',
      skillLevel: 'INTERMEDIATE',
      instrumentType: 'KEYBOARD',
    },
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
    practiceSummary: {
      weeklyPracticeHours: 21,
      monthlyPracticeHours: 60,
      monthLabel: '6월',
    },
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
        description: '5음 음계 기반의 스케일로, 대중음악에서\n가장 널리 쓰이는 직관적인 라인입니다.',
      },
    ],
  };

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-[#090A0F] py-6">
      {/* 1. 상단 출석 및 연습시간 현황판 섹션 */}
      <AttendanceSection data={mockDashboardData} />

      {/* 2. 진행 중인 학습 배너 섹션 (텍스트 버전) */}
      <LearningBanner data={mockDashboardData.currentLearning} />
      
      {/* 3. 추천 학습 */}
      <RecommendedLearnings data={mockDashboardData.recommendedLearnings} />
    </div>
  );
}
