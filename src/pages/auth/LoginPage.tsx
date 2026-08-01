// 로그인 / 회원가입 페이지
import { useSearchParams } from 'react-router-dom';
import LogoTypo from '@/assets/landing/logo.svg?react';
import KakaoIcon from '@/assets/auth/kakao.svg?react';
import GoogleIcon from '@/assets/auth/google.svg?react';
import type { OAuthErrorCode, SocialType } from '@/types/auth';
import { getSocialLoginUrl } from '@/apis/auth';

const OAUTH_ERROR_MESSAGES: Record<OAuthErrorCode, string | null> = {
  access_denied: null,
  invalid_state: '로그인 유효 시간이 지났어요. 다시 시도해 주세요.',
  invalid_auth_request: '로그인 유효 시간이 지났어요. 다시 시도해 주세요.',
  oauth_failed: '소셜 로그인 서버와 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
  authentication_failed: '로그인에 실패했어요. 다시 시도해 주세요.',
};

const DEFAULT_ERROR_MESSAGE = '로그인에 실패했어요. 다시 시도해 주세요.';

function getErrorMessage(error: string | null): string | null {
  if (!error) return null;
  if (error in OAUTH_ERROR_MESSAGES) return OAUTH_ERROR_MESSAGES[error as OAuthErrorCode];
  return DEFAULT_ERROR_MESSAGE;
}

function LoginPage() {
  const [searchParams] = useSearchParams();
  const errorMessage = getErrorMessage(searchParams.get('error'));

  const handleSocialLogin = (socialType: SocialType) => {
    window.location.href = getSocialLoginUrl(socialType);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6">
      <div className="flex w-full max-w-[644px] flex-col items-center gap-[200px]">
        {/* 로고 */}
        <LogoTypo className="text-primary-400 h-auto w-full max-w-[618px]" aria-label="MUSE REVIEW" />

        {/* 소셜 로그인 버튼 */}
        <div className="flex w-full flex-col gap-5">
          {errorMessage && (
            <p role="alert" className="body-medium text-error text-center">
              {errorMessage}
            </p>
          )}
          {/* 카카오 */}
          <button
            type="button"
            onClick={() => handleSocialLogin('KAKAO')}
            className="heading-small-m flex w-full items-center justify-center gap-3 rounded-full bg-[#ffe812] px-6 py-3 text-gray-950">
            <span className="flex size-[52px] items-center justify-center">
              <KakaoIcon className="size-7" />
            </span>
            카카오로 시작하기
          </button>

          {/* 구글 */}
          <button
            type="button"
            onClick={() => handleSocialLogin('GOOGLE')}
            className="heading-small-m flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-gray-950">
            <span className="flex size-[52px] items-center justify-center">
              <GoogleIcon className="size-8" />
            </span>
            Google로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
