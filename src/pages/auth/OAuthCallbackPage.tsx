import { exchangeToken } from '@/apis/auth';
import { saveTokens } from '@/utils/authStorage';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const redirectToLogin = (error: string) => {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
    };

    // 백엔드가 실패를 ?error= 로 전달한 경우
    const error = searchParams.get('error');
    if (error) {
      redirectToLogin(error);
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      redirectToLogin('invalid_auth_request');
      return;
    }

    exchangeToken(code)
      .then((result) => {
        saveTokens(result.tokenInfo);
        navigate(result.isOnboardingCompleted ? '/main' : '/onboarding/terms', { replace: true });
      })
      .catch(() => {
        redirectToLogin('authentication_failed');
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6">
      <p role="status" aria-live="polite" className="heading-medium-m text-gray-300">
        로그인 중입니다...
      </p>
    </div>
  );
}
