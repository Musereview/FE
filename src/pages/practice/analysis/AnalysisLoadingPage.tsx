import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { checkAnalysisStatus } from '@/apis/analysis';
import LoadingPage from '@/pages/common/LoadingPage';

export default function AnalysisLoadingPage() {
  const navigate = useNavigate();
  // practiceId 또는 historyId 중 존재하는 쪽을 사용
  const { practiceId, historyId } = useParams<{ practiceId?: string; historyId?: string }>();
  const targetId = practiceId ?? historyId;
  const basePath = practiceId ? 'practice' : 'history'; // 결과 페이지로 갈 때 어느 경로 prefix를 쓸지 결정
  const location = useLocation();

  const {
    analysisId,
    rangeXml,
    analysisData,
    audioUrl,
    recording,
    latencyMs,
    audioStartOffsetSec,
    timeSignature,
    key,
  } = location.state || {};

  const isPollingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!analysisId) {
        alert('분석 정보가 존재하지 않습니다. 이전 페이지로 돌아갑니다.');
        navigate(-1);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [analysisId, navigate]);

  const retryCountRef = useRef(0);
  const MAX_RETRIES = 150;
  const POLL_INTERVAL_MS = 2000;

  const pollAnalysisStatus = useCallback(async () => {
    if (!analysisId || isPollingRef.current) return;

    if (retryCountRef.current >= MAX_RETRIES) {
      isPollingRef.current = false;
      alert('분석 요청 시간이 초과되었습니다. 다시 시도해주세요.');
      navigate(-1);
      return;
    }

    try {
      isPollingRef.current = true;
      retryCountRef.current += 1;

      const statusRes = await checkAnalysisStatus(analysisId);

      if (statusRes.status === 'COMPLETED') {
        if (!targetId) {
          alert('연습/히스토리 정보를 찾을 수 없습니다.');
          navigate(-1);
          return;
        }
        const startBar = analysisData?.startBar || 1;
        const endBar = analysisData?.endBar || analysisData?.totalBars || 30;

        navigate(`/${basePath}/${targetId}/analysis/result?start=${startBar}&end=${endBar}`, {
          state: {
            rangeXml,
            analysisData,
            analysisId,
            recording,
            latencyMs,
            audioUrl,
            audioStartOffsetSec,
            timeSignature,
            key,
            fromHistory: basePath === 'history', // 결과 페이지 뒤로가기 버튼 분기용
          },
          replace: true,
        });
      } else if (statusRes.status === 'FAILED') {
        isPollingRef.current = false;
        alert('연주 분석에 실패했습니다. 다시 시도해주세요.');
        navigate(-1);
      } else {
        isPollingRef.current = false;
      }
    } catch (error) {
      console.log('폴링 에러:', error);
      isPollingRef.current = false;
    }
  }, [
    analysisId,
    analysisData,
    navigate,
    targetId,
    basePath,
    rangeXml,
    recording,
    latencyMs,
    audioUrl,
    audioStartOffsetSec,
    timeSignature,
    key,
  ]);

  useEffect(() => {
    if (!analysisId) return;

    pollAnalysisStatus();
    const intervalId = setInterval(() => {
      pollAnalysisStatus();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [analysisId, pollAnalysisStatus]);

  return <LoadingPage />;
}
