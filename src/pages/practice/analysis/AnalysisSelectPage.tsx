import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ScoreViewer, { type ScoreViewerHandle } from '@/components/score/ScoreViewer';
import { useScoreCursorSync } from '@/hooks/music/useScoreCursorSync';
import { computeMeasureTimings } from '@/utils/musicXmlTiming';
import { extractMeasureRange } from '@/utils/musicXmlMeasureRange';
import LoadingPage from '@/pages/common/LoadingPage';
import ChevronLeftIcon from '@/assets/practice/chevron-left.svg?react';
import PlayIcon from '@/assets/practice/play.svg?react';
import ReplayIcon from '@/assets/practice/replay.svg?react';

export default function AnalysisSelectPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams<{ practiceId: string }>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [startMeasure, setStartMeasure] = useState('1마디');
  const [endMeasure, setEndMeasure] = useState('30마디');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [xmlContent, setXmlContent] = useState('');
  const [measureStartTimes, setMeasureStartTimes] = useState<number[]>([]);
  const [totalMeasures, setTotalMeasures] = useState<number>(30);

  const scoreViewerRef = useRef<ScoreViewerHandle>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 언마운트 시 토스트 타이머 정리
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // 1) 전체 MusicXML은 최초 1회만 fetch
  useEffect(() => {
    let cancelled = false;
    fetch('/sample.xml')
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        setXmlContent(text);
        const timings = computeMeasureTimings(text);
        setMeasureStartTimes(timings.measureStartTimes);
        if (timings.measureStartTimes.length > 0) {
          const measuresCount = timings.measureStartTimes.length;
          setTotalMeasures(measuresCount);

          setEndMeasure(`${measuresCount}마디`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) 오디오 엘리먼트 (페이지 진입 시 프리로드 적용으로 재생 딜레이 방지)
  useEffect(() => {
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audio.preload = 'auto'; // 미리 로드(프리로드) 설정
    audio.load(); //즉시 로드(딜레이 방지)
    audioRef.current = audio;
    audio.onended = () => handleRewind();
    return () => {
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  // 3) 오디오 진행 시간 -> 현재 마디 인덱스 (커서 싱크)
  const { currentMeasureIndex } = useScoreCursorSync({
    audioRef,
    measureStartTimes,
    isPlaying,
  });

  const handleRewind = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
    scoreViewerRef.current?.reset();
  }, []);

  const extractNumber = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? '' : num.toString();
  };
  const handleFocus = (val: string, setter: (v: string) => void) => setter(extractNumber(val));
  const handleBlur = (val: string, setter: (v: string) => void, defaultVal: string) => {
    const onlyNum = extractNumber(val);
    setter(!onlyNum || onlyNum === '0' ? defaultVal : `${onlyNum}마디`);
  };
  const handleChange = (val: string, setter: (v: string) => void) => setter(val.replace(/[^0-9]/g, ''));

  const getMeasureNumber = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const triggerToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // 4) 분석하기 버튼 클릭 시 유효성 검사 및 로딩/이동 처리
  const handleStartAnalysis = () => {
    const startNum = getMeasureNumber(startMeasure);
    const endNum = getMeasureNumber(endMeasure);
    const diff = endNum - startNum + 1;

    // 1. 종료 마디 < 시작 마디 검사
    if (endNum < startNum) {
      triggerToast('분석 종료 마디는 시작 마디보다 같거나 커야 합니다.');
      return;
    }

    // 2. 시작 마디와 종료 마디가 같거나 범위를 벗어난 경우 (동일 마디, diff <= 0)
    if (startNum === 0 || endNum === 0 || diff <= 0) {
      triggerToast('분석 구간은 최소 1마디 이상이어야 합니다.');
      return;
    }

    // 3. 32마디 초과 검사
    if (diff > 32) {
      triggerToast('분석 구간은 최대 32마디까지 선택할 수 있습니다.');
      return;
    }

    // 4. 존재하지 않는 마디 입력 검사 (악보 범위를 벗어난 경우)
    if (startNum > totalMeasures || endNum > totalMeasures) {
      triggerToast('선택한 마디가 악보 범위를 벗어났습니다.');
      return;
    }

    audioRef.current?.pause();

    const parsedPlayingId = practiceId ? parseInt(practiceId, 10) : 31;

    const mockAnalysisData = {
      analysisId: 10,
      playingId: isNaN(parsedPlayingId) ? 31 : parsedPlayingId,
      status: 'PENDING',
      startBar: startNum,
      endBar: endNum,
      createdAt: new Date().toISOString(),
    };

    const rangeXml = extractMeasureRange(xmlContent, startNum, endNum);

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate(`/practice/${practiceId || '1'}/analysis/result?start=${startNum}&end=${endNum}`, {
        state: { rangeXml, analysisData: mockAnalysisData },
      });
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full min-w-[1280px] bg-gray-950 px-4 py-[60px] font-sans text-gray-100 select-none md:px-16 xl:px-[120px]">
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-gray-950">
          <LoadingPage />
        </div>
      )}

      {toastMessage && (
        <div
          role="alert"
          className="bg-error body-small fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] px-[24px] py-[16px] text-gray-100 shadow-2xl">
          <span>⚠️</span> {toastMessage}
        </div>
      )}

      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="button-small flex items-center gap-2 text-gray-400 transition-colors hover:text-gray-100">
          <ChevronLeftIcon className="size-5" />
          연습으로
        </button>

        <h1 className="heading-medium-b mt-[32px] text-gray-100">분석 파트 설정</h1>

        <div className="mt-[35px] flex w-full items-end justify-between">
          <div className="flex h-[52px] items-center gap-[16px]">
            {/* 재생 / 정지 버튼  */}
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center bg-transparent transition-all outline-none hover:scale-105 active:scale-95">
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="52"
                  height="52"
                  viewBox="0 0 52 52"
                  fill="none"
                  className="text-primary-400">
                  <rect x="15" y="11" width="7" height="30" rx="2" fill="currentColor" />
                  <rect x="30" y="11" width="7" height="30" rx="2" fill="currentColor" />
                </svg>
              ) : (
                <PlayIcon className="size-9" />
              )}
            </button>

            {/* 되돌아가기(리와인드) 버튼 */}
            <button
              type="button"
              onClick={handleRewind}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[6px] bg-gray-800 text-gray-400 transition-all outline-none hover:scale-105 active:scale-95">
              <ReplayIcon className="size-6" />
            </button>
          </div>

          <div className="flex items-end gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label htmlFor="analysis-start-measure" className="caption-medium text-gray-600">
                분석 시작 마디
              </label>
              <input
                id="analysis-start-measure"
                type="text"
                value={startMeasure}
                onFocus={() => handleFocus(startMeasure, setStartMeasure)}
                onBlur={() => handleBlur(startMeasure, setStartMeasure, '1마디')}
                onChange={(e) => handleChange(e.target.value, setStartMeasure)}
                className="button-label1 focus:border-primary-400 h-[48px] w-[140px] rounded-[8px] border border-gray-800/60 bg-gray-900 px-[16px] text-center text-gray-100 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label htmlFor="analysis-end-measure" className="caption-medium text-gray-600">
                분석 종료 마디
              </label>
              <input
                id="analysis-end-measure"
                type="text"
                value={endMeasure}
                onFocus={() => handleFocus(endMeasure, setEndMeasure)}
                onBlur={() => handleBlur(endMeasure, setEndMeasure, `${totalMeasures}마디`)}
                onChange={(e) => handleChange(e.target.value, setEndMeasure)}
                className="button-label1 focus:border-primary-400 h-[48px] w-[140px] rounded-[8px] border border-gray-800/60 bg-gray-900 px-[16px] text-center text-gray-100 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleStartAnalysis}
              className="button-label1 bg-primary-400 hover:bg-primary-500 flex h-[48px] cursor-pointer items-center gap-[8px] rounded-[8px] px-[24px] text-gray-950 transition-all active:scale-[0.98]">
              분석하기
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-[24px]">
        {xmlContent && (
          <ScoreViewer
            ref={scoreViewerRef}
            xmlContent={xmlContent}
            currentMeasureIndex={currentMeasureIndex}
            followPlayback={isPlaying}
            height={480}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
