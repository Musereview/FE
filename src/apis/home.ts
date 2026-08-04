import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { DashboardData } from '@/types/home';

const HOME_ENDPOINT = '/api/home';

export async function fetchDashboardData(): Promise<DashboardData> {
  // 나중에 실제 백엔드 연동 시:
  const { data } = await axiosInstance.get<ApiResponse<DashboardData>>(HOME_ENDPOINT);
  return data.data;

  // 현재 프론트엔드 단독 테스트용 목업 데이터
  // const mockResponse: ApiResponse<DashboardData> = {
  //   isSuccess: true,
  //   code: 'COMMON200',
  //   message: '요청에 성공하였습니다.',
  //   data: {
  //     user: {
  //       userId: 1,
  //       nickname: '김뮤즈',
  //       profileImgUrl: 'https://cdn.example.com/profile/1.png',
  //       skillLevel: 'INTERMEDIATE',
  //       instrumentType: 'KEYBOARD',
  //     },
  //     streak: {
  //       currentDays: 4,
  //       message: '4일 연속 학습 중이에요!',
  //       weeklyAttendance: [
  //         { dayOfWeek: 'MON', label: '월', status: 'COMPLETED' },
  //         { dayOfWeek: 'TUE', label: '화', status: 'MISSED' },
  //         { dayOfWeek: 'WED', label: '수', status: 'COMPLETED' },
  //         { dayOfWeek: 'THU', label: '목', status: 'TODAY_COMPLETED' },
  //         { dayOfWeek: 'FRI', label: '금', status: 'EMPTY' },
  //         { dayOfWeek: 'SAT', label: '토', status: 'EMPTY' },
  //         { dayOfWeek: 'SUN', label: '일', status: 'EMPTY' },
  //       ],
  //     },
  //     practiceSummary: {
  //       weeklyPracticeHours: 21,
  //       monthlyPracticeHours: 60,
  //       monthLabel: '6월',
  //     },
  //     currentLearning: {
  //       learningId: 5,
  //       title: 'Tension Notes',
  //       subtitle: '11th 텐션 노트 활용하기',
  //       level: 'ADVANCED',
  //       progressRate: 10,
  //       nextStepId: 13,
  //     },
  //     recommendedLearnings: [
  //       {
  //         learningId: 5,
  //         title: 'Lydian Scale',
  //         subtitle: '밝고 몽환적인 색채를 가진 모드.',
  //         level: 'ADVANCED',
  //         nextStepId: 13,
  //       },
  //       {
  //         learningId: 6,
  //         title: 'Pentatonic Scale',
  //         subtitle: '5음 음계로 블루스, 록, 팝에서 사용',
  //         level: 'INTERMEDIATE',
  //         nextStepId: 14,
  //       },
  //     ],
  //     recentPlayings: [
  //       {
  //         playingId: 31,
  //         title: 'Jazz Standard Practice',
  //         genre: 'JAZZ',
  //         key: 'C Major',
  //         bpm: 120,
  //         playedAt: '2026-05-04T14:32:00',
  //         relativeTime: '오늘',
  //         durationMinutes: 12,
  //       },
  //     ],
  //   },
  // };

  // return mockResponse.data;
}
