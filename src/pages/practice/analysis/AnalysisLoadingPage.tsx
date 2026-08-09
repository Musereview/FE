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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!analysisId) {
        alert('분석 정보가 존재하지 않습니다. 이전 페이지로 돌아갑니다.');
        navigate(-1);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [analysisId, navigate]);

  //무한 루프 및 무한 폴링 방지를 위한 최대 재시도 횟수 설정(2초 * 150번 =300초)
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 150;
  const POLL_INTERVAL_MS = 2000;

  // 로딩 화면이 떠 있는 동안 실행되는 폴링 로직
  const pollAnalysisStatus = useCallback(async () => {
    if (!analysisId || isPollingRef.current) return;

    //최대 시도 횟수를 초과한 경우 강제 중단 및 처리
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
        if (!practiceId) {
          alert('연습 정보(practiceId)를 찾을 수 없습니다.');
          navigate(-1);
          return;
        }
        //분석 완료 시 결과 페이지로 이동
        const startBar = analysisData?.startBar || 1;
        const endBar = analysisData?.endBar || analysisData?.totalBars || 30;

        navigate(`/practice/${practiceId || '1'}/analysis/result?start=${startBar}&end=${endBar}`, {
          state: { rangeXml, analysisData, analysisId, recording, latencyMs, audioUrl },
          replace: true,
        });
      } else if (statusRes.status === 'FAILED') {
        //서버에서 분석 실패를 응답한 경우 처리
        isPollingRef.current = false;
        alert('연주 분석에 실패했습니다. 다시 시도해주세요.');
        navigate(-1);
      } else {
        //아직 처리 중이면 다시 폴링 가능하도록 플래그 해제
        isPollingRef.current = false;
      }
    } catch (error) {
      console.log('폴링 에러:', error);
      isPollingRef.current = false;
    }
  }, [analysisId, analysisData, navigate, practiceId, rangeXml, recording, latencyMs, audioUrl]);

  useEffect(() => {
    if (!analysisId) return;

    // 로딩 화면이 진입 즉시 지연 없이 1회 상태 확인 실행
    pollAnalysisStatus();

    const intervalId = setInterval(() => {
      pollAnalysisStatus();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [analysisId, pollAnalysisStatus]);

  return <LoadingPage />;
}
