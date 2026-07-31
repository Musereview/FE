export type SocialType = 'KAKAO' | 'GOOGLE';

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
}

// 로그인 성공 응답 (소셜 로그인 / 임시 코드 교환 공통)
export interface AuthResult {
  userId: number;
  nickname: string | null;
  isNewUser: boolean;
  isOnboardingCompleted: boolean;
  tokenInfo: TokenInfo;
}

// 임시 교환 코드 -> JWT 교환 요청
export interface ExchangeCodeRequest {
  code: string;
}

// 토큰 재발급 요청
export interface ReissueRequest {
  refreshToken: string;
}

// 로그아웃 요청 (refreshToken을 서버에서 만료 처리)
export interface LogoutRequest {
  refreshToken: string;
}

export type ReissueResponse = TokenInfo;

export type OAuthErrorCode =
  'access_denied' | 'invalid_state' | 'invalid_auth_request' | 'oauth_failed' | 'authentication_failed';
