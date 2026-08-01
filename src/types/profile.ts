// GET /api/users/verify-nickname 응답 data
export interface CheckNicknameResponse {
  nickname: string; // 검증한 닉네임
  available: boolean; // 사용 가능 여부
  message: string; // 화면에 바로 표시할 안내 문구
}

// 화성학 숙련도
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

// 요금제
export type SubscriptionTier = 'FREE' | 'STANDARD' | 'PRO';

// 악기 종류 (MVP는 피아노 단일)
export type InstrumentType = 'PIANO';

// 누적 활동 통계
export interface ProfileStatistics {
  practiceSessionCount: number; // 연습 세션 수
  totalPracticeMinutes: number; // 총 연습 시간(분)
  completedLearningCount: number; // 학습한 이론 수
}

// GET /api/users/me/profile 응답 data
export interface Profile {
  nickname: string;
  profileImgUrl: string; // 서버가 항상 유효한 URL(기본 이미지) 반환
  instrumentType: InstrumentType;
  skillLevel: SkillLevel;
  subscriptionTier: SubscriptionTier;
  statistics: ProfileStatistics;
}

// PATCH /api/users/me/profile 요청
export interface UpdateProfileRequest {
  nickname: string;
  skillLevel: SkillLevel;
}

// PATCH /api/users/me/profile 응답 data
export interface UpdateProfileResponse {
  userId: number;
  nickname: string;
  skillLevel: SkillLevel;
  updatedAt: string;
}

// POST /api/users/me/profile 요청 (온보딩 최초 등록)
export interface RegisterProfileRequest {
  nickname: string;
  skillLevel: SkillLevel;
}

// POST /api/users/me/profile 응답 data
export interface RegisterProfileResponse {
  userId: number;
  nickname: string;
  skillLevel: SkillLevel;
  instrumentType: InstrumentType; // 서버가 PIANO로 고정 등록
  subscriptionTier: SubscriptionTier; // 서버가 PRO로 고정 등록
  profileImgUrl: string;
}

export const SKILL_LEVEL_OPTIONS: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급',
  ADVANCED: '전공',
};

export const SUBSCRIPTION_LABEL: Record<SubscriptionTier, string> = {
  FREE: 'Free Plan',
  STANDARD: 'Standard Plan',
  PRO: 'Pro Plan',
};

export const INSTRUMENT_LABEL: Record<InstrumentType, string> = {
  PIANO: 'Piano',
};
