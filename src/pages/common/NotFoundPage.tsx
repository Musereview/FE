import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '@/utils/authStorage';

function NotFoundPage() {
  const navigate = useNavigate();

  const [canGoBack] = useState(() => window.history.length > 1);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = '페이지를 찾을 수 없습니다 | MuseReview';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const handleGoHome = () => {
    navigate(getAccessToken() ? '/main' : '/', { replace: true });
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-12 bg-gray-950 px-6 text-gray-300">
      <div className="flex flex-col items-center gap-6">
        <p className="display-small text-primary-400">404</p>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="heading-medium-b text-gray-100">페이지를 찾을 수 없습니다</h1>
        <p className="body-medium text-gray-400">
          주소가 변경되었거나 삭제된 페이지예요.
          <br />
          입력하신 주소가 정확한지 확인해 주세요.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {canGoBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="button-large1 h-[60px] w-[210px] cursor-pointer rounded-[6px] border-[0.5px] border-gray-600 text-gray-300 transition-colors hover:bg-gray-800">
            이전 페이지
          </button>
        )}
        <button
          type="button"
          onClick={handleGoHome}
          className="button-large1 bg-primary-400 hover:bg-primary-500 h-[60px] w-[210px] cursor-pointer rounded-[4px] text-gray-950 transition-colors">
          홈으로 가기
        </button>
      </div>
    </main>
  );
}

export default NotFoundPage;
