import type { AuthResult, ExchangeCodeRequest, LogoutRequest, SocialType } from '@/types/auth';
import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';

const OAUTH_CALLBACK_PATH = '/oauth/callback';

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

// 로그아웃 - 서버에 저장된 refreshToken 만료 처리
export async function logout(refreshToken: string): Promise<void> {
  const body: LogoutRequest = { refreshToken };

  await axiosInstance.post<ApiResponse<null>>('/api/auth/logout', body);
}

// 회원 탈퇴
export async function withdraw(): Promise<void> {
  await axiosInstance.post<ApiResponse<null>>('/api/auth/withdraw');
}
