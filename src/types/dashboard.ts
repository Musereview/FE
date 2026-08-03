export interface UserInfo {
  userId: number;
  nickname: string;
  profileImgUrl: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  instrumentType: string | null;
}

export interface AttendanceDay {
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  label: string;
  status: 'COMPLETED' | 'TODAY_COMPLETED' | 'MISSED' | 'EMPTY';
}

export interface StreakInfo {
  currentDays: number;
  message: string;
  weeklyAttendance: AttendanceDay[];
}

export interface PracticeSummary {
  weeklyPracticeHours: number;
  monthlyPracticeHours: number;
  monthLabel: string;
}

export interface CurrentLearning {
  learningId: number;
  title: string;
  subtitle: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  progressRate: number;
  nextStepId: number;
}

export interface RecommendedLearning {
  learningId: number;
  title: string;
  subtitle: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  nextStepId: number;
}

export interface RecentPlaying {
  playingId: number;
  title: string;
  genre: string | null;
  key: string | null;
  bpm: number;
  playedAt: string;
  relativeTime: string;
  durationMinutes: number;
}

export interface DashboardData {
  user: UserInfo;
  streak: StreakInfo;
  practiceSummary: PracticeSummary;
  currentLearning: CurrentLearning | null;
  recommendedLearnings: RecommendedLearning[];
  recentPlayings: RecentPlaying[];
}

export interface DashboardResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  data: DashboardData;
}
