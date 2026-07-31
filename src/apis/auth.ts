import type { AuthResult, ExchangeCodeRequest, ReissueRequest, ReissueResponse, SocialType } from '@/types/auth';
import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';

const OAUTH_CALLBACK_PATH = '/auth/callback';

// 소셜 로그인 시작 URL
export function getSocialLoginUrl(SocialType: SocialType): string {
  const redirectUri = encodeURIComponent(`${window.location.origin}${OAUTH_CALLBACK_PATH}`);
  return `${import.meta.env.VITE_API_BASE_URL}/api/auth/login/${SocialType}?redirectUri=${redirectUri}`;
}

// 코드 -> 토큰 교환
export async function exchangeToken(code: string): Promise<AuthResult> {
  const body: ExchangeCodeRequest = { code };

  const { data } = await axiosInstance.post<ApiResponse<AuthResult>>('/api/auth/token/exchange', body);
  return data.data;
}

// refreshToken -> accessToken 재발급
export async function reissueToken(refreshToken: string): Promise<ReissueResponse> {
  const body: ReissueRequest = { refreshToken };

  const { data } = await axiosInstance.post<ApiResponse<ReissueResponse>>('/api/auth/reissue', body);
  return data.data;
}
