// import { useOutletContext } from 'react-router-dom';
// import AttendanceSection from '@/components/main/AttendanceSection';
// import LearningBanner from '@/components/main/LearningBanner';
// import RecommendedLearnings from '@/components/main/RecommandLearn';
// import RecentPractices from '@/components/main/RecentPractices';
// import DashboardNoti from '@/components/main/DashboardNoti';
// import type { NotiItem } from '@/types/notification';

// interface LayoutContextType {
//   onOpenNotification: () => void;
//   notiList: NotiItem[];
//   onReadItem: (id: number) => void;
// }

// export default function MainPage() {
//   const { onOpenNotification, notiList, onReadItem } = useOutletContext<LayoutContextType>();

//   const mockDashboardData = {
//     user: { nickname: '김뮤즈' },
//     streak: {
//       currentDays: 4,
//       message: '4일 연속 학습 중이에요!',
//       weeklyAttendance: [
//         { dayOfWeek: 'MON', label: '월', status: 'COMPLETED' },
//         { dayOfWeek: 'TUE', label: '화', status: 'EMPTY' },
//         { dayOfWeek: 'WED', label: '수', status: 'COMPLETED' },
//         { dayOfWeek: 'THU', label: '목', status: 'TODAY_COMPLETED' },
//         { dayOfWeek: 'FRI', label: '금', status: 'EMPTY' },
//         { dayOfWeek: 'SAT', label: '토', status: 'EMPTY' },
//         { dayOfWeek: 'SUN', label: '일', status: 'EMPTY' },
//       ],
//     },
//     practiceSummary: { weeklyPracticeHours: 21, monthlyPracticeHours: 60, monthLabel: '6월' },
//     currentLearning: {
//       learningId: 5,
//       title: 'Tension Notes',
//       subtitle: '11th 텐션 노트 활용하기',
//       level: 'ADVANCED',
//       progressRate: 10,
//     },
//     recommendedLearnings: [
//       {
//         learningId: 1,
//         title: 'Lydian Scale',
//         level: 'ADVANCED',
//         description: '밝고 몽환적인 색채를 가진 모드.\n#4도 음정이 특징입니다.',
//       },
//       {
//         learningId: 2,
//         title: 'Pentatonic Scale',
//         level: 'INTERMEDIATE',
//         description: '5음 음계로 블루스, 록, 팝에서\n광범위하게 사용됩니다.',
//       },
//     ],
//     recentPractices: [
//       {
//         practiceId: 101,
//         title: 'Jazz Standard Practice',
//         genre: 'JAZZ',
//         keySignature: 'C Major',
//         bpm: 120,
//         timeLabel: '오늘 · 12분',
//       },
//       {
//         practiceId: 102,
//         title: 'Modal Interchange Practice',
//         genre: 'JAZZ',
//         keySignature: 'C Major',
//         bpm: 120,
//         timeLabel: '어제 · 15분',
//       },
//       {
//         practiceId: 103,
//         title: 'Voice Leading Exercise',
//         genre: 'JAZZ',
//         keySignature: 'C Major',
//         bpm: 120,
//         timeLabel: '4월 30일 · 10분',
//       },
//       {
//         practiceId: 104,
//         title: 'Blues Scale Improvisation',
//         genre: 'JAZZ',
//         keySignature: 'C Major',
//         bpm: 120,
//         timeLabel: '4월 29일 · 8분',
//       },
//     ],
//   };

//   return (
//     <div className="flex w-full flex-col bg-[#090A0F] pb-[44px]">
//       {/* 1. 상단 출석 현황판 섹션  */}
//       <AttendanceSection data={mockDashboardData} />

//       {/* 2. 중간 블록: 진행 중인 학습 / 추천 학습 */}
//       <div className="mx-auto mt-[54px] grid w-full max-w-[1400px] grid-cols-2 gap-6 px-10">
//         <div className="flex w-full flex-col">
//           <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
//             진행 중인 학습
//           </h3>
//           <LearningBanner data={mockDashboardData.currentLearning} />
//         </div>

//         <div className="flex w-full flex-col">
//           <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
//             추천 학습
//           </h3>
//           <RecommendedLearnings data={mockDashboardData.recommendedLearnings} />
//         </div>
//       </div>

//       {/* 3. 하단 블록: 최근 연습 / 알림 */}
//       <div className="mx-auto mt-[98px] grid w-full max-w-[1400px] grid-cols-2 gap-6 px-10">
//         <div className="flex w-full flex-col">
//           <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
//             최근 연습
//           </h3>
//           <RecentPractices data={mockDashboardData.recentPractices} />
//         </div>

//         <div className="flex w-full flex-col">
//           <div className="mb-3 flex w-full items-center justify-between">
//             <h3 className="flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
//               알림
//             </h3>

//             <button
//               type="button"
//               onClick={onOpenNotification}
//               className="cursor-pointer border-none bg-transparent p-0 font-sans text-xs text-gray-500 transition-colors outline-none hover:text-gray-400">
//               전체 보기
//             </button>
//           </div>

//           <DashboardNoti data={notiList} onReadItem={onReadItem} />
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/main/MainPage.tsx
import { useOutletContext } from 'react-router-dom';
import AttendanceSection from '@/components/main/AttendanceSection';
import LearningBanner from '@/components/main/LearningBanner';
import RecommendedLearnings from '@/components/main/RecommandLearn';
import RecentPractices from '@/components/main/RecentPractices';
import DashboardNoti from '@/components/main/DashboardNoti';
import type { NotiItem } from '@/types/notification';
import type { DashboardResponse } from '@/types/dashboard';

interface LayoutContextType {
  onOpenNotification: () => void;
  notiList: NotiItem[];
  onReadItem: (id: number) => void;
}

export default function MainPage() {
  const { onOpenNotification, notiList, onReadItem } = useOutletContext<LayoutContextType>();

  const mockDashboardData: DashboardResponse = {
    user: {
      userId: 1,
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
        { dayOfWeek: 'TUE', label: '화', status: 'MISSED' }, // 명세서 기준 MISSED 반영
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
    // currentLearning: {
    //   learningId: 5,
    //   title: 'Tension Notes',
    //   subtitle: '11th 텐션 노트 활용하기',
    //   level: 'ADVANCED',
    //   progressRate: 10,
    //   nextStepId: 13, // 명세서 기준 nextStepId 추가
    // },
    currentLearning: null,
    recommendedLearnings: [
      {
        learningId: 5,
        title: 'Lydian Scale',
        subtitle: '밝고 몽환적인 색채를 가진 모드.',
        level: 'ADVANCED',
        nextStepId: 13,
      },
      {
        learningId: 5,
        title: 'Pentatonic Scale',
        subtitle: '5음 음계로 블루스, 록, 팝에서 사용',
        level: 'INTERMEDIATE',
        nextStepId: 14,
      },
    ],

    recentPlayings: [
      // {
      //   playingId: 31,
      //   title: 'Jazz Standard Practice',
      //   genre: 'JAZZ',
      //   key: 'C Major',
      //   bpm: 120,
      //   playedAt: '2026-05-04T14:32:00',
      //   relativeTime: '오늘',
      //   durationMinutes: 12,
      // },
    ],
  };

  return (
    <div className="flex w-full flex-col bg-[#090A0F] pb-[44px]">
      {/* 1. 상단 출석 현황판 섹션 */}
      <AttendanceSection data={mockDashboardData} />

      {/* 2. 중간 블록: 진행 중인 학습 / 추천 학습 */}
      <div className="mx-auto mt-[54px] grid w-full max-w-[1400px] grid-cols-2 gap-6 px-10">
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

      {/* 3. 하단 블록: 최근 연습 / 알림 */}
      <div className="mx-auto mt-[98px] grid w-full max-w-[1400px] grid-cols-2 gap-6 px-10">
        <div className="flex w-full flex-col">
          <h3 className="mb-3 flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
            최근 연습
          </h3>
          <RecentPractices data={mockDashboardData.recentPlayings} />
        </div>

        <div className="flex w-full flex-col">
          <div className="mb-3 flex w-full items-center justify-between">
            <h3 className="flex items-center font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8]">
              알림
            </h3>

            <button
              type="button"
              onClick={onOpenNotification}
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
