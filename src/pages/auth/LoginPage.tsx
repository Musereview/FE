// 로그인 / 회원가입 페이지
import LogoTypo from '@/assets/landing/logo.svg?react';
import kakaoIcon from '@/assets/auth/kakao.png';
import googleIcon from '@/assets/auth/google.png';

function LoginPage() {
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
            className="heading-small-m text-gray-950 flex w-full items-center justify-center gap-3 rounded-full bg-[#ffe812] px-6 py-3">
            <span className="flex size-[52px] items-center justify-center">
              <img src={kakaoIcon} alt="" className="size-[42px] rounded-full object-cover" />
            </span>
            카카오로 시작하기
          </button>

          {/* 구글 */}
          <button
            type="button"
            className="heading-small-m text-gray-950 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3">
            <span className="flex size-[52px] items-center justify-center">
              <img src={googleIcon} alt="" className="size-8 object-cover" />
            </span>
            Google로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
