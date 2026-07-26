// 로그인 / 회원가입 페이지
import { useNavigate } from 'react-router-dom';
import LogoTypo from '@/assets/landing/logo.svg?react';
import KakaoIcon from '@/assets/auth/kakao.svg?react';
import GoogleIcon from '@/assets/auth/google.svg?react';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-[644px] flex-col items-center gap-[200px]">
        {/* 로고 */}
        <LogoTypo
          className="text-primary-400 h-auto w-full max-w-[618px]"
          aria-label="MUSE REVIEW"
        />

        {/* 소셜 로그인 버튼 */}
        <div className="flex w-full flex-col gap-5">
          {/* 카카오 */}
          <button
            type="button"
            onClick={() => navigate('/onboarding/terms')}
            className="heading-small-m text-gray-950 flex w-full items-center justify-center gap-3 rounded-full bg-[#ffe812] px-6 py-3">
            <span className="flex size-[52px] items-center justify-center">
              <KakaoIcon className="size-7" />
            </span>
            카카오로 시작하기
          </button>

          {/* 구글 */}
          <button
            type="button"
            onClick={() => navigate('/onboarding/terms')}
            className="heading-small-m text-gray-950 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3">
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
