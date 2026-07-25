import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ScoreViewer, { type ScoreViewerHandle } from '@/components/score/ScoreViewer';
import { useScoreCursorSync } from '@/hooks/music/useScoreCursorSync';
import { computeMeasureTimings } from '@/utils/musicXmlTiming';
import { extractMeasureRange } from '@/utils/musicXmlMeasureRange';
import LoadingPage from '@/pages/common/LoadingPage';

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
    const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // 👈 사용할 음원 주소 통일const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

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
        state: { rangeXml, analysisData: mockAnalysisData, audioUrl },
      });
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full min-w-[1280px] bg-[#0B0F19] px-4 py-[60px] font-sans text-white select-none md:px-16 xl:px-[120px]">
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19]">
          <LoadingPage />
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] bg-[#E02424] px-[24px] py-[16px] text-[16px] font-bold text-white shadow-2xl">
          <span>⚠️</span> {toastMessage}
        </div>
      )}

      <div className="flex flex-col">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-[8px] text-[15px] font-medium text-[#CECFD1] transition-colors hover:text-white">
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 1.5L1.5 7.5L8 13.5"
              stroke="#CECFD1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>{' '}
          연습으로
        </button>

        <h1 className="mt-[32px] text-[28px] font-bold tracking-tight text-white">분석 파트 설정</h1>

        <div className="mt-[35px] flex w-full items-end justify-between">
          <div className="flex h-[52px] items-center gap-[16px]">
            {/* 재생 / 정지 버튼  */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center bg-transparent transition-all outline-none hover:scale-105 active:scale-95">
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <rect x="15" y="11" width="7" height="30" rx="2" fill="#69FFC0" />
                  <rect x="30" y="11" width="7" height="30" rx="2" fill="#69FFC0" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <path
                    d="M40.4208 25.384C41.1931 25.88 41.1931 27.12 40.4208 27.6159L16.7377 42.8254C15.9654 43.3214 15 42.7014 15 41.7095L15 11.2905C15 10.2986 15.9654 9.67858 16.7377 10.1746L40.4208 25.384Z"
                    fill="#69FFC0"
                  />
                </svg>
              )}
            </button>

            {/* 되돌아가기(리와인드) 버튼 */}
            <button
              onClick={handleRewind}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[6px] bg-[#2B2E36] transition-all outline-none hover:scale-105 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
                <rect width="52" height="52" rx="6" fill="#2B2E36" />
                <path
                  d="M31.199 9.86647C31.6985 9.63189 32.2939 9.8468 32.5291 10.346L34.8865 15.3548C35.2162 16.0554 34.9152 16.8912 34.2147 17.221L29.2059 19.5784C28.7061 19.8135 28.11 19.5986 27.8748 19.0989C27.6399 18.5992 27.8547 18.0039 28.3543 17.7688L31.4559 16.3089C29.3421 15.3169 26.9815 14.9465 24.6522 15.2532C21.9784 15.6053 19.4947 16.8296 17.5877 18.7366C15.6811 20.6435 14.4563 23.1266 14.1043 25.8001C13.7524 28.4737 14.2931 31.1892 15.6414 33.5247C16.9898 35.86 19.0709 37.686 21.5623 38.718C24.0537 39.75 26.8169 39.9314 29.4217 39.2337C32.0265 38.5357 34.3288 36.997 35.9705 34.8577C37.6121 32.7183 38.5026 30.0963 38.5027 27.3997C38.5027 26.8475 38.9506 26.3998 39.5027 26.3997C40.0549 26.3998 40.5027 26.8475 40.5027 27.3997C40.5026 30.5366 39.4671 33.5868 37.5574 36.0755C35.6477 38.564 32.9693 40.3534 29.9393 41.1653C26.9092 41.977 23.6958 41.7661 20.7977 40.5657C17.8994 39.3652 15.4776 37.2415 13.909 34.5247C12.3406 31.808 11.7126 28.6494 12.1219 25.5393C12.5313 22.4293 13.9557 19.5408 16.1736 17.3225C18.3919 15.1043 21.2812 13.6793 24.3914 13.2698C27.0854 12.9152 29.8154 13.3397 32.2635 14.4788L30.7195 11.1975C30.4847 10.6979 30.6994 10.1016 31.199 9.86647Z"
                  fill="#CECFD1"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-end gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-medium text-[#86899C]">분석 시작 마디</label>
              <input
                type="text"
                value={startMeasure}
                onFocus={() => handleFocus(startMeasure, setStartMeasure)}
                onBlur={() => handleBlur(startMeasure, setStartMeasure, '1마디')}
                onChange={(e) => handleChange(e.target.value, setStartMeasure)}
                className="h-[48px] w-[140px] rounded-[8px] border border-[#2E3142]/60 bg-[#1F212A] px-[16px] text-center text-[15px] font-semibold text-white focus:border-[#69FFC0] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-medium text-[#86899C]">분석 종료 마디</label>
              <input
                type="text"
                value={endMeasure}
                onFocus={() => handleFocus(endMeasure, setEndMeasure)}
                onBlur={() => handleBlur(endMeasure, setEndMeasure, `${totalMeasures}마디`)}
                onChange={(e) => handleChange(e.target.value, setEndMeasure)}
                className="h-[48px] w-[140px] rounded-[8px] border border-[#2E3142]/60 bg-[#1F212A] px-[16px] text-center text-[15px] font-semibold text-white focus:border-[#69FFC0] focus:outline-none"
              />
            </div>

            <button
              onClick={handleStartAnalysis}
              className="flex h-[48px] cursor-pointer items-center gap-[8px] rounded-[8px] bg-[#69FFC0] px-[24px] text-[15px] font-bold text-[#0B0F19] transition-all hover:bg-[#52E0A7] active:scale-[0.98]">
              분석하기
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0B0F19"
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
