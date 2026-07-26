import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { getProfile, registerProfile, updateProfile } from '@/apis/profile';
import type { Profile, RegisterProfileRequest, UpdateProfileRequest } from '@/types/profile';

export const PROFILE_QUERY_KEY = ['profile'] as const;

// ===== MOCK =====
let mockProfile: Profile = {
  nickname: '김뮤즈',
  profileImgUrl: null,
  instrumentType: 'KEYBOARD',
  skillLevel: 'INTERMEDIATE',
  subscriptionTier: 'FREE',
  statistics: {
    practiceSessionCount: 24,
    totalPracticeMinutes: 350,
    completedLearningCount: 8,
  },
};

async function mockGetProfile(): Promise<Profile> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...mockProfile };
}

async function mockUpdateProfile(body: UpdateProfileRequest): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockProfile = { ...mockProfile, nickname: body.nickname, skillLevel: body.skillLevel };
}

async function mockRegisterProfile(body: RegisterProfileRequest): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockProfile = { ...mockProfile, nickname: body.nickname, skillLevel: body.skillLevel };
}

// 프로필 조회
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => mockGetProfile(),
    // queryFn: () => getProfile(),
  });
}

// 프로필 수정
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => mockUpdateProfile(body),
    // mutationFn: (body: UpdateProfileRequest) => updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

// 프로필 최초 등록 (온보딩)
export function useRegisterProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RegisterProfileRequest) => mockRegisterProfile(body),
    // mutationFn: (body: RegisterProfileRequest) => registerProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
