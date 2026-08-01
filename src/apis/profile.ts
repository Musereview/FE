import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  CheckNicknameResponse,
  Profile,
  RegisterProfileRequest,
  RegisterProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@/types/profile';

const CHECK_NICKNAME_ENDPOINT = '/api/users/verify-nickname';
const PROFILE_ENDPOINT = '/api/users/me/profile';

// 닉네임 중복/형식 검증
export async function checkNicknameDuplicate(nickname: string): Promise<CheckNicknameResponse> {
  const { data } = await axiosInstance.get<ApiResponse<CheckNicknameResponse>>(CHECK_NICKNAME_ENDPOINT, {
    params: { nickname },
  });
  return data.data;
}

// 프로필 조회 (닉네임/악기/숙련도/요금제/통계)
export async function getProfile(): Promise<Profile> {
  const { data } = await axiosInstance.get<ApiResponse<Profile>>(PROFILE_ENDPOINT);
  return data.data;
}

// 프로필 수정 (닉네임/숙련도) — 409 시 닉네임 중복
export async function updateProfile(body: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<UpdateProfileResponse>>(PROFILE_ENDPOINT, body);
  return data.data;
}

// 프로필 최초 등록 (온보딩) — 409 시 닉네임 중복 또는 이미 등록된 사용자
export async function registerProfile(body: RegisterProfileRequest): Promise<RegisterProfileResponse> {
  const { data } = await axiosInstance.post<ApiResponse<RegisterProfileResponse>>(PROFILE_ENDPOINT, body);
  return data.data;
}
