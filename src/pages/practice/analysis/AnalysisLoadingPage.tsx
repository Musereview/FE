import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { checkAnalysisStatus } from '@/apis/analysis';
import LoadingPage from '@/pages/common/LoadingPage';

export default function AnalysisLoadingPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams<{ practiceId: string }>();
  const location = useLocation();

  const { analysisId, rangeXml, analysisData, audioUrl, recording, latencyMs } = location.state || {};
  const isPollingRef = useRef(false);

  // 로딩 화면이 떠 있는 동안 실행되는 폴링 로직
  const pollAnalysisStatus = useCallback(async () => {
    if (!analysisId || isPollingRef.current) return;

    try {
      isPollingRef.current = true;
      const statusRes = await checkAnalysisStatus(analysisId);

      if (statusRes.status === 'COMPLETED') {
        // 분석 완료 시 결과 페이지로 이동!
        const startBar = analysisData?.startBar || 1;
        const endBar = analysisData?.endBar || 30;

        navigate(`/practice/${practiceId || '1'}/analysis/result?start=${startBar}&end=${endBar}`, {
          state: { rangeXml, analysisData, analysisId, recording, latencyMs, audioUrl },
          replace: true,
        });
      } else {
        // 아직 처리 중이면 다시 폴링 가능하도록 플래그 해제
        isPollingRef.current = false;
      }
    } catch (error) {
      console.error('폴링 에러:', error);
      isPollingRef.current = false;
    }
  }, [analysisId, analysisData, location.state, navigate, practiceId, rangeXml, recording, latencyMs, audioUrl]);

  useEffect(() => {
    // 로딩 화면이 유지되는 동안 2초마다 상태 확인 API 호출 (폴링!)
    const intervalId = setInterval(() => {
      pollAnalysisStatus();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [pollAnalysisStatus]);

  return <LoadingPage />;
}
