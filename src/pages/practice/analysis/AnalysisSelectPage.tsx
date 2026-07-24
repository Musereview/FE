// 경로 : C:\project\MuseReview\FE\src\pages\practice\analysis\AnalysisSelectPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ScoreViewer, { type ScoreViewerHandle } from '@/components/score/ScoreViewer';
import { useScoreCursorSync } from '@/hooks/music/useScoreCursorSync';
import { computeMeasureTimings } from '@/utils/musicXmlTiming';
import { extractMeasureRange } from '@/utils/musicXmlMeasureRange';

export default function AnalysisSelectPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams<{ practiceId: string }>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [startMeasure, setStartMeasure] = useState('1마디');
  const [endMeasure, setEndMeasure] = useState('30마디');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [xmlContent, setXmlContent] = useState('');
  const [measureStartTimes, setMeasureStartTimes] = useState<number[]>([]);
  const [totalMeasures, setTotalMeasures] = useState<number>(30);

  const scoreViewerRef = useRef<ScoreViewerHandle>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
          setTotalMeasures(timings.measureStartTimes.length);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) 오디오 엘리먼트 (테스트용 공개 MP3 링크 장착으로 소리와 커서 연동 확인 가능)
  useEffect(() => {
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
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

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 4) 분석하기 버튼 클릭 시 목업 데이터를 태워 곧바로 다음 페이지로 이동
  const handleStartAnalysis = () => {
    const startNum = getMeasureNumber(startMeasure);
    const endNum = getMeasureNumber(endMeasure);
    const diff = endNum - startNum + 1;

    // 1. 종료 마디 < 시작 마디 검사
    if (endNum < startNum) {
      triggerToast('분석 종료 마디는 시작 마디보다 같거나 커야 합니다.');
      return;
    }

    if (startNum === 0 || endNum === 0 || diff <= 0) {
      triggerToast('올바른 분석 구간을 설정해 주세요.');
      return;
    }

    // 2. 32마디 초과 검사
    if (diff > 32) {
      triggerToast('분석 구간은 최대 32마디까지 선택할 수 있습니다.');
      return;
    }

    // 3. 존재하지 않는 마디 입력 검사 (악보 범위를 벗어난 경우)
    if (startNum > totalMeasures || endNum > totalMeasures) {
      triggerToast('선택한 마디가 악보 범위를 벗어났습니다.');
      return;
    }

    audioRef.current?.pause();

    const parsedPlayingId = practiceId ? parseInt(practiceId, 10) : 31;

    // 완벽한 테스트를 위한 목업 응답 데이터 구성
    const mockAnalysisData = {
      analysisId: 10,
      playingId: isNaN(parsedPlayingId) ? 31 : parsedPlayingId,
      status: 'PENDING',
      startBar: startNum,
      endBar: endNum,
      createdAt: new Date().toISOString(),
    };

    // 마디 구간 XML 자르기 및 상태 전달과 함께 결과 페이지로 이동
    const rangeXml = extractMeasureRange(xmlContent, startNum, endNum);
    navigate(`/practice/${practiceId || '1'}/analysis/result?start=${startNum}&end=${endNum}`, {
      state: { rangeXml, analysisData: mockAnalysisData },
    });
  };

  return (
    <div className="relative min-h-screen w-full min-w-[1280px] bg-[#090A0F] px-4 py-[60px] font-sans text-white select-none md:px-16 xl:px-[120px]">
      {toastMessage && (
        <div className="fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] bg-[#E02424] px-[24px] py-[16px] text-[16px] font-bold text-white shadow-2xl">
          <span>⚠️</span> {toastMessage}
        </div>
      )}

      <div className="flex flex-col">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-[6px] text-[15px] font-medium text-[#A6A8B2] transition-colors hover:text-white">
          <span className="text-[12px]">＜</span> 연습으로
        </button>

        <h1 className="mt-[44px] text-[28px] font-bold tracking-tight text-white">분석 파트 설정</h1>

        <div className="mt-[35px] flex w-full items-end justify-between">
          <div className="flex h-[52px] items-center gap-[19px]">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="flex h-[26px] w-[33px] cursor-pointer items-center justify-center bg-transparent transition-all outline-none hover:scale-105 active:scale-95">
              {isPlaying ? (
                <svg width="26" height="33" viewBox="0 0 26 33" fill="none">
                  <rect x="3" y="1" width="6" height="31" rx="1.5" fill="#69FFC0" />
                  <rect x="17" y="1" width="6" height="31" rx="1.5" fill="#69FFC0" />
                </svg>
              ) : (
                <svg width="26" height="33" viewBox="0 0 26 33" fill="none">
                  <path
                    d="M25.4208 15.384C26.1931 15.88 26.1931 17.12 25.4208 17.6159L1.73767 32.8254C0.965374 33.3214 0 32.7014 0 31.7095L0 1.29051C0 0.298557 0.965378 -0.321418 1.73768 0.17456L25.4208 15.384Z"
                    fill="#69FFC0"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={handleRewind}
              className="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[6px] transition-all outline-none hover:scale-105 active:scale-95">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <rect width="52" height="52" rx="6" fill="#2B2E36" />
                <path
                  d="M31.1991 9.8666C31.6986 9.63179 32.2949 9.84675 32.5301 10.3461L34.8875 15.3549C35.2172 16.0554 34.9161 16.8913 34.2157 17.2211L29.2059 19.5785C28.7063 19.8134 28.1109 19.5986 27.8758 19.099C27.6407 18.5994 27.8549 18.0042 28.3543 17.7689L31.4569 16.308C29.3431 15.3161 26.9824 14.9457 24.6532 15.2523C21.9794 15.6043 19.4957 16.8288 17.5887 18.7357C15.682 20.6426 14.4574 23.1257 14.1053 25.7992C13.7533 28.473 14.2941 31.1883 15.6424 33.5238C16.9908 35.8593 19.0719 37.6851 21.5633 38.7172C24.0548 39.7492 26.8178 39.9307 29.4227 39.2328C32.0276 38.5348 34.3298 36.9963 35.9715 34.8568C37.6131 32.7173 38.5037 30.0955 38.5038 27.3988C38.5039 26.8467 38.9516 26.3988 39.5038 26.3988C40.0558 26.399 40.5036 26.8468 40.5038 27.3988C40.5037 30.5358 39.4681 33.5858 37.5584 36.0746C35.6487 38.5633 32.9704 40.3525 29.9403 41.1644C26.9102 41.9763 23.6969 41.7653 20.7987 40.5648C17.9003 39.3643 15.4786 37.2407 13.91 34.5238C12.3416 31.8071 11.7135 28.6486 12.1229 25.5385C12.5324 22.4284 13.9566 19.5399 16.1747 17.3217C18.393 15.1034 21.2822 13.6784 24.3924 13.2689C27.0866 12.9144 29.8164 13.3397 32.2645 14.4789L30.7206 11.1977C30.4857 10.6981 30.6997 10.1018 31.1991 9.8666Z"
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
                onBlur={() => handleBlur(endMeasure, setEndMeasure, '30마디')}
                onChange={(e) => handleChange(e.target.value, setEndMeasure)}
                className="h-[48px] w-[140px] rounded-[8px] border border-[#2E3142]/60 bg-[#1F212A] px-[16px] text-center text-[15px] font-semibold text-white focus:border-[#69FFC0] focus:outline-none"
              />
            </div>

            <button
              onClick={handleStartAnalysis}
              className="flex h-[48px] cursor-pointer items-center gap-[6px] rounded-[8px] bg-[#69FFC0] px-[24px] text-[15px] font-bold text-[#090A0F] transition-all hover:bg-[#52E0A7] active:scale-[0.98]">
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

      <div className="mt-[5px]">
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
