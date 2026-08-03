export interface AttendanceDay {
  dayOfWeek: string;
  label: string;
  status: 'COMPLETED' | 'TODAY_COMPLETED' | 'MISSED' | 'EMPTY';
}

export interface UserInfo {
  userId: number;
  nickname: string;
  profileImgUrl: string | null;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  instrumentType: string | null;
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

export interface RecommendedLearningItem {
  learningId: number;
  title: string;
  subtitle: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  nextStepId: number;
}

export interface RecentPlayingItem {
  playingId: number;
  title: string;
  genre: string | null;
  key: string | null;
  bpm: number;
  playedAt: string;
  relativeTime: string;
  durationMinutes: number;
}

export interface DashboardResponse {
  user: UserInfo;
  streak: StreakInfo;
  practiceSummary: PracticeSummary;
  currentLearning: CurrentLearning | null;
  recommendedLearnings: RecommendedLearningItem[];
  recentPlayings: RecentPlayingItem[];
}
