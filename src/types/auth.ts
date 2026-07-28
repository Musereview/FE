export type SocialTyle = 'KAKAO' | 'GOOGLE';

export interface SocialLoginRequest {
  accessToken: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenExprirationTime: number;
}

export interface SocialLoginResponse {
  userId: number;
  nickname: string | null;
  isNewUser: boolean;
  tokenInfo: TokenInfo;
}
