import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, registerProfile, updateProfile } from '@/apis/profile';
import type { RegisterProfileRequest, UpdateProfileRequest } from '@/types/profile';

export const PROFILE_QUERY_KEY = ['profile'] as const;

// 프로필 조회
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => getProfile(),
  });
}

// 프로필 수정
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

// 프로필 최초 등록
export function useRegisterProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RegisterProfileRequest) => registerProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
