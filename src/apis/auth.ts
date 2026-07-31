import type { ApiResponse } from '@/types/api';
import { axiosInstance } from './axiosInstance';
import type { SocialLoginRequest, SocialLoginResponse, SocialType } from '@/types/auth';

export async function socialLogin(socialType: SocialType, socialAccessToken: string): Promise<SocialLoginResponse> {
  const body: SocialLoginRequest = {
    accessToken: socialAccessToken,
  };

  const response = await axiosInstance.post<ApiResponse<SocialLoginResponse>>(`/auth/social/${socialType}`, body);

  return response.data.data;
}
