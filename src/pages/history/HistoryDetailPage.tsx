import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Tone from 'tone';

import ScoreViewer, { type ScoreViewerHandle } from '@/components/score/ScoreViewer';
import {
  computeMeasureTimings,
  findMeasureIndexAtTime,
  extractActiveTempoMeterAtMeasure,
} from '@/utils/musicXmlTiming';
import { extractMeasureRange } from '@/utils/musicXmlMeasureRange';
import { useMetronome } from '@/hooks/useMetronome';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import LoadingPage from '@/pages/common/LoadingPage';

export default function HistoryDetailPage() {
  const navigate = useNavigate();
  const { historyId } = useParams<{ historyId: string }>();
  const parsedHistoryId = Number(historyId) || 1;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isScoreReady, setIsScoreReady] = useState(false);
  const [startMeasure, setStartMeasure] = useState('1마디');
  const [endMeasure, setEndMeasure] = useState('30마디');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [xmlContent, setXmlContent] = useState('');
  const [measureStartTimes, setMeasureStartTimes] = useState<number[]>([]);
  const [sectionStartOffsetSec, setSectionStartOffsetSec] = useState(0);
  const [sectionDurationSec, setSectionDurationSec] = useState(0);
  const [totalMeasures, setTotalMeasures] = useState<number>(30);

  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  const [beatInBar, setBeatInBar] = useState(-1);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [bpm, setBpm] = useState(120);

  const scoreViewerRef = useRef<ScoreViewerHandle>(null);
  const playbackTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { start, stop, pause } = useMetronome();
  const isScoreLoading = !isScoreReady;

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadScoreInfo() {
      try {
        const text = await fetch('/sample.xml').then((r) => r.text());
        if (cancelled || !text) return;
        setXmlContent(text);

        const timings = computeMeasureTimings(text);
        setMeasureStartTimes(timings.measureStartTimes);

        if (timings.measureStartTimes.length > 0) {
          const measuresCount = timings.measureStartTimes.length;
          setTotalMeasures(measuresCount);
          setEndMeasure(`${measuresCount}마디`);
        }

        const sIdx = 0;
        const eIdx = timings.measureStartTimes.length - 1;

        const offsetSec = timings.measureStartTimes[sIdx] ?? 0;
        const endSec = timings.measureStartTimes[eIdx] ?? timings.totalDuration;

        setSectionStartOffsetSec(offsetSec);
        playbackTimeRef.current = offsetSec;
        setSectionDurationSec(Math.max(2, endSec - offsetSec));
        setCurrentMeasureIndex(sIdx);

        const { bpm: activeBpm, beats } = extractActiveTempoMeterAtMeasure(text, 1);
        setBpm(activeBpm);
        setBeatsPerBar(beats);
      } catch (e) {
        console.error('MusicXML 분석 실패:', e);
      }
    }

    loadScoreInfo();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      start(bpm, beatsPerBar, (time, bib) => {
        Tone.getDraw().schedule(() => {
          setBeatInBar(bib);
        }, time);
      });
    } else {
      pause();
    }
  }, [isPlaying, bpm, beatsPerBar, start, pause]);

  useEffect(() => {
    if (!isPlaying || measureStartTimes.length === 0) return;

    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      playbackTimeRef.current += deltaSec;
      const elapsed = playbackTimeRef.current;
      const rangeEndSec = sectionStartOffsetSec + sectionDurationSec;

      if (elapsed >= rangeEndSec) {
        setIsPlaying(false);
        stop();
        playbackTimeRef.current = sectionStartOffsetSec;
        setCurrentMeasureIndex(0);
        scoreViewerRef.current?.jumpToMeasure(0);
        setToastMessage('재생이 완료되었습니다.');
        toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const idx = findMeasureIndexAtTime(measureStartTimes, Math.max(0, elapsed));
      setCurrentMeasureIndex((prev) => (prev !== idx ? idx : prev));

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, measureStartTimes, sectionStartOffsetSec, sectionDurationSec, stop]);

  const handleTogglePlay = async () => {
    if (isScoreLoading) return;
    await Tone.start();
    setIsPlaying((p) => !p);
  };

  const handleRewind = useCallback(() => {
    setIsPlaying(false);
    stop();

    playbackTimeRef.current = sectionStartOffsetSec;
    setCurrentMeasureIndex(0);
    setBeatInBar(-1);

    scoreViewerRef.current?.jumpToMeasure(0);

    setToastMessage('처음 마디로 되돌아가셨습니다.');
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, [sectionStartOffsetSec, stop]);

  const handleRewindClick = () => {
    if (isScoreLoading) return;
    handleRewind();
  };

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

  const handleAddAnalysis = () => {
    const startNum = getMeasureNumber(startMeasure);
    const endNum = getMeasureNumber(endMeasure);
    const diff = endNum - startNum + 1;

    if (endNum < startNum) {
      triggerToast('분석 종료 마디는 시작 마디보다 같거나 커야 합니다.');
      return;
    }
    if (startNum === 0 || endNum === 0 || diff <= 0) {
      triggerToast('분석 구간은 최소 1마디 이상이어야 합니다.');
      return;
    }
    if (diff > 32) {
      triggerToast('분석 구간은 최대 32마디까지 선택할 수 있습니다.');
      return;
    }
    if (startNum > totalMeasures || endNum > totalMeasures) {
      triggerToast('선택한 마디가 악보 범위를 벗어났습니다.');
      return;
    }

    setIsPlaying(false);
    stop();
    setIsLoading(true);

    const rangeXml = extractMeasureRange(xmlContent, startNum, endNum);

    setTimeout(() => {
      setIsLoading(false);
      navigate(`/history/${parsedHistoryId}/analysis/result?start=${startNum}&end=${endNum}`, {
        state: { rangeXml },
      });
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gray-950 pt-[68px] pb-[100px] font-sans text-gray-100 select-none">
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

      {/* [< 히스토리] 버튼: 겹침 방지를 위해 왼쪽 충분히 여유 확보 */}
      <div className="absolute top-[74px] left-[10px] z-10 shrink-0 xl:left-[35px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            color: '#CECFD1',
            fontFamily: 'Pretendard',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '30px',
            letterSpacing: '-0.36px',
          }}
          className="flex cursor-pointer items-center gap-[8px] transition-colors hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="aspect-square shrink-0">
            <path
              d="M16 19.5L7 12L16 4.5"
              stroke="#CECFD1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          히스토리
        </button>
      </div>

      {/* 중앙 정렬 및 가로 스크롤 방지 래퍼 */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-6 md:px-12 xl:px-0">
        {/* 상단 곡 제목 및 메타 정보 */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h1 className="text-[32px] leading-tight font-bold tracking-tight text-white">Jazz Standard Practice</h1>

            <div
              style={{
                display: 'flex',
                padding: '4px 12px',
                alignItems: 'center',
                gap: '24px',
                borderRadius: '4px',
                background: '#CECFD1',
                marginTop: '16px',
                width: 'fit-content',
              }}>
              <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-[#1B1E27]">JAZZ</span>
              <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-[#1B1E27]">C Major</span>
              <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-[#1B1E27]">{bpm}BPM</span>
            </div>
          </div>

          <span className="text-[15px] font-medium text-gray-400">5월 4일 · 14:32</span>
        </div>

        {/* 플레이어 컨트롤 바 & 메트로놈 닷츠 영역 */}
        <div className="mt-[24px] flex items-center justify-between">
          <div className="flex h-[52px] items-center gap-[16px]">
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isScoreLoading}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center bg-transparent transition-all outline-none hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30">
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

            <button
              type="button"
              onClick={handleRewindClick}
              disabled={isScoreLoading}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[6px] bg-[#2B2E36] transition-all outline-none hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
                <rect width="52" height="52" rx="6" fill="#2B2E36" />
                <path
                  d="M31.199 9.86647C31.6985 9.63189 32.2939 9.8468 32.5291 10.346L34.8865 15.3548C35.2162 16.0554 34.9152 16.8912 34.2147 17.221L29.2059 19.5784C28.7061 19.8135 28.11 19.5986 27.8748 19.0989C27.6399 18.5992 27.8547 18.0039 28.3543 17.7688L31.4559 16.3089C29.3421 15.3169 26.9815 14.9465 24.6522 15.2532C21.9784 15.6053 19.4947 16.8296 17.5877 18.7366C15.6811 20.6435 14.4563 23.1266 14.1043 25.8001C13.7524 28.4737 14.2931 31.1892 15.6414 33.5247C16.9898 35.86 19.0709 37.686 21.5623 38.718C24.0537 39.75 26.8169 39.9314 29.4217 39.2337C32.0265 38.5357 34.3288 36.997 35.9705 34.8577C37.6121 32.7183 38.5026 30.0963 38.5027 27.3997C38.5027 26.8475 38.9506 26.3998 39.5027 26.3997C40.0549 26.3998 40.5027 26.8475 40.5027 27.3997C40.5026 30.5366 39.4671 33.5868 37.5574 36.0755C35.6477 38.564 32.9693 40.3534 29.9393 41.1653C26.9092 41.977 23.6958 41.7661 20.7977 40.5657C17.8994 39.3652 15.4776 37.2415 13.909 34.5247C12.3406 31.808 11.7126 28.6494 12.1219 25.5393C12.5313 22.4293 13.9557 19.5408 16.1736 17.3225C18.3919 15.1043 21.2812 13.6793 24.3914 13.2698C27.0854 12.9152 29.8154 13.3397 32.2635 14.4788L30.7195 11.1975C30.4847 10.6979 30.6994 10.1016 31.199 9.86647Z"
                  fill="#CECFD1"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center">
            <MetronomeDots total={beatsPerBar} current={isPlaying ? beatInBar : -1} />
          </div>
        </div>
      </div>

      {/* 악보 뷰어 영역 */}
      <div className="mx-auto mt-[24px] w-full max-w-[1280px] px-6 md:px-12 xl:px-0">
        {xmlContent && (
          <ScoreViewer
            ref={scoreViewerRef}
            xmlPath={'/sample.xml'}
            currentMeasureIndex={currentMeasureIndex}
            followPlayback={isPlaying}
            height={440}
            className="w-full"
            onReady={() => {
              setIsScoreReady(true);
              setCurrentMeasureIndex(0);
              scoreViewerRef.current?.jumpToMeasure(0);
            }}
          />
        )}
      </div>

      {/* 분석 파트 설정 및 리포트 카드 영역 */}
      <div className="mx-auto mt-[76px] flex w-full max-w-[1280px] flex-col px-6 md:px-12 xl:px-0">
        <h2
          style={{
            alignSelf: 'stretch',
            color: '#E7E7E8',
            fontFamily: 'Pretendard',
            fontSize: '24px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '36px',
            letterSpacing: '-0.6px',
          }}>
          분석 파트 설정
        </h2>

        <div className="mt-[24px] flex flex-col gap-[16px]">
          {/* 분석 카드 1 */}
          <div
            style={{
              display: 'flex',
              height: '152px',
              padding: '24px 40px',
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'stretch',
              borderRadius: '6px',
              background: '#2B2E36',
            }}>
            {/* 왼쪽 정보 영역 */}
            <div className="flex flex-col gap-[8px]">
              <span
                style={{
                  alignSelf: 'stretch',
                  color: '#FFF',
                  fontFamily: 'Pretendard',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '30px',
                  letterSpacing: '-0.4px',
                }}>
                5마디-10마디 분석 리포트
              </span>
              <div className="flex items-center gap-[16px]">
                <span
                  style={{
                    alignSelf: 'stretch',
                    color: '#868A91',
                    fontFamily: 'Pretendard',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '30px',
                    letterSpacing: '-0.36px',
                  }}>
                  1줄 정리
                </span>
                <div className="flex items-center gap-[4px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="aspect-square shrink-0">
                    <path
                      d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM11.5 8C11.7759 8.00026 11.9999 8.22407 12 8.5V13.002H14.5049C14.7806 13.0022 15.0046 13.2262 15.0049 13.502C15.0049 13.7779 14.7808 14.0017 14.5049 14.002H11.7998C11.3581 14.0018 11 13.6439 11 13.2021V8.5C11.0001 8.22391 11.2239 8 11.5 8Z"
                      fill="#AEB1B6"
                    />
                  </svg>
                  <span
                    style={{
                      color: '#AEB1B6',
                      fontFamily: 'Pretendard',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '22px',
                      letterSpacing: '-0.28px',
                    }}>
                    소요시간 30초
                  </span>
                </div>
              </div>
            </div>

            {/* 오른쪽 영역 (5-10마디 텍스트와 리포트보기 버튼) */}
            <div className="flex items-center gap-[32px]">
              <span
                style={{
                  color: '#868A91',
                  textAlign: 'center',
                  fontFamily: 'Pretendard',
                  fontSize: '22px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '32px',
                  letterSpacing: '-0.44px',
                }}>
                5마디-10마디
              </span>

              <button
                type="button"
                onClick={() => navigate(`/history/${parsedHistoryId}/analysis/result`)}
                style={{
                  display: 'flex',
                  width: '193px',
                  height: '60px',
                  padding: '6px 12px 6px 14px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                  borderRadius: '6px',
                  border: '0.5px solid #69FFC0',
                  background: 'transparent',
                }}
                className="cursor-pointer transition-all hover:bg-white/5 active:scale-[0.98]">
                <span className="text-center text-[16px] leading-[28px] font-medium tracking-[-0.32px] text-[#69FFC0]">
                  리포트보기
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="aspect-square shrink-0">
                  <path
                    d="M8.5 19.5L16.5 12L8.5 4.5"
                    stroke="#69FFC0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 분석 카드 2 */}
          <div
            style={{
              display: 'flex',
              height: '152px',
              padding: '24px 40px',
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'stretch',
              borderRadius: '6px',
              background: '#2B2E36',
            }}>
            {/* 왼쪽 정보 영역 */}
            <div className="flex flex-col gap-[8px]">
              <span
                style={{
                  alignSelf: 'stretch',
                  color: '#FFF',
                  fontFamily: 'Pretendard',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '30px',
                  letterSpacing: '-0.4px',
                }}>
                5마디-10마디 분석 리포트
              </span>
              <div className="flex items-center gap-[16px]">
                <span
                  style={{
                    alignSelf: 'stretch',
                    color: '#868A91',
                    fontFamily: 'Pretendard',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '30px',
                    letterSpacing: '-0.36px',
                  }}>
                  1줄 정리
                </span>
                <div className="flex items-center gap-[4px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="aspect-square shrink-0">
                    <path
                      d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM11.5 8C11.7759 8.00026 11.9999 8.22407 12 8.5V13.002H14.5049C14.7806 13.0022 15.0046 13.2262 15.0049 13.502C15.0049 13.7779 14.7808 14.0017 14.5049 14.002H11.7998C11.3581 14.0018 11 13.6439 11 13.2021V8.5C11.0001 8.22391 11.2239 8 11.5 8Z"
                      fill="#AEB1B6"
                    />
                  </svg>
                  <span
                    style={{
                      color: '#AEB1B6',
                      fontFamily: 'Pretendard',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '22px',
                      letterSpacing: '-0.28px',
                    }}>
                    소요시간 30초
                  </span>
                </div>
              </div>
            </div>

            {/* 오른쪽 영역 (5-10마디 텍스트와 리포트보기 버튼) */}
            <div className="flex items-center gap-[32px]">
              <span
                style={{
                  color: '#868A91',
                  textAlign: 'center',
                  fontFamily: 'Pretendard',
                  fontSize: '22px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '32px',
                  letterSpacing: '-0.44px',
                }}>
                5마디-10마디
              </span>

              <button
                type="button"
                onClick={() => navigate(`/history/${parsedHistoryId}/analysis/result`)}
                style={{
                  display: 'flex',
                  width: '193px',
                  height: '60px',
                  padding: '6px 12px 6px 14px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                  borderRadius: '6px',
                  border: '0.5px solid #69FFC0',
                  background: 'transparent',
                }}
                className="cursor-pointer transition-all hover:bg-white/5 active:scale-[0.98]">
                <span className="text-center text-[16px] leading-[28px] font-medium tracking-[-0.32px] text-[#69FFC0]">
                  리포트보기
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="aspect-square shrink-0">
                  <path
                    d="M8.5 19.5L16.5 12L8.5 4.5"
                    stroke="#69FFC0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 하단 마디 선택 및 추가 분석하기 영역 */}
        <div className="mt-[44px] flex items-end justify-between">
          <div className="flex items-end gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label
                style={{
                  alignSelf: 'stretch',
                  color: '#E7E7E8',
                  fontFamily: 'Pretendard',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '30px',
                  letterSpacing: '-0.4px',
                }}>
                분석 시작 마디
              </label>
              <input
                type="text"
                value={startMeasure}
                onFocus={() => handleFocus(startMeasure, setStartMeasure)}
                onBlur={() => handleBlur(startMeasure, setStartMeasure, '1마디')}
                onChange={(e) => handleChange(e.target.value, setStartMeasure)}
                style={{
                  width: '174px',
                  height: '60px',
                  padding: '0 18px',
                  borderRadius: '6px',
                  background: '#2B2E36',
                  color: '#E7E7E8',
                  fontFamily: 'Pretendard',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '30px',
                  letterSpacing: '-0.36px',
                }}
                className="text-center focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label
                style={{
                  alignSelf: 'stretch',
                  color: '#E7E7E8',
                  fontFamily: 'Pretendard',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '30px',
                  letterSpacing: '-0.4px',
                }}>
                분석 종료 마디
              </label>
              <input
                type="text"
                value={endMeasure}
                onFocus={() => handleFocus(endMeasure, setEndMeasure)}
                onBlur={() => handleBlur(endMeasure, setEndMeasure, `${totalMeasures}마디`)}
                onChange={(e) => handleChange(e.target.value, setEndMeasure)}
                style={{
                  width: '174px',
                  height: '60px',
                  padding: '0 18px',
                  borderRadius: '6px',
                  background: '#2B2E36',
                  color: '#E7E7E8',
                  fontFamily: 'Pretendard',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '30px',
                  letterSpacing: '-0.36px',
                }}
                className="text-center focus:outline-none"
              />
            </div>
          </div>

          {/* 추가 분석하기 버튼 */}
          <button
            type="button"
            onClick={handleAddAnalysis}
            style={{
              display: 'flex',
              width: '366px',
              height: '60px',
              padding: '6px 12px 6px 14px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '6px',
              background: '#69FFC0',
            }}
            className="cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]">
            <span className="text-[16px] font-bold text-[#1B1E27]">추가 분석하기</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="aspect-square shrink-0">
              <path
                d="M8.5 19.5L16.5 12L8.5 4.5"
                stroke="#1B1E27"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
