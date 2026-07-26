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
import LoadingPage from '@/pages/common/LoadingPage';

// 분리한 컴포넌트들 임포트
import HistoryHeader from '@/components/history/HistoryHeader';
import HistoryPlayerBar from '@/components/history/HistoryPlayerBar';
import AnalysisReportList from '@/components/history/AnalysisReportList';
import MeasureSelectForm from '@/components/history/MeasureSelectForm';

// API 명세서 기준 Mock Data
const MOCK_HISTORY_DETAIL = {
  playingId: 31,
  title: 'Jazz Standard Practice',
  genre: 'JAZZ',
  key: 'C Major',
  bpm: 120,
  timeSignature: '4/4',
  playedAt: '2026-05-04T14:32:00',
  durationMinutes: 10,
  durationSec: 612,
  totalBars: null,
  analyses: [
    {
      analysisId: 10,
      startBar: 5,
      endBar: 10,
      title: '5마디-10마디 분석 리포트',
      oneLineSummary: '긴장감을 오래 유지하는 흐름이 많았어요.',
      status: 'COMPLETED',
      estimatedSeconds: null,
      createdAt: '2026-05-04T14:35:00',
    },
    {
      analysisId: 11,
      startBar: 11,
      endBar: 16,
      title: '11마디-16마디 분석 리포트',
      oneLineSummary: '코드 연결은 안정적이지만 보이스리딩 보완이 필요합니다.',
      status: 'COMPLETED',
      estimatedSeconds: null,
      createdAt: '2026-05-04T14:40:00',
    },
  ],
};

export default function HistoryDetailPage() {
  const navigate = useNavigate();
  const { historyId } = useParams<{ historyId: string }>();
  const parsedHistoryId = Number(historyId) || 31;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isScoreReady, setIsScoreReady] = useState(false);
  const [startMeasure, setStartMeasure] = useState('1마디');
  const [endMeasure, setEndMeasure] = useState('30마디');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock Data 세팅 (추후 실제 API 연동 시 axios 호출로 교체 가능)
  const [historyData] = useState(MOCK_HISTORY_DETAIL);

  const [xmlContent, setXmlContent] = useState('');
  const [measureStartTimes, setMeasureStartTimes] = useState<number[]>([]);
  const [sectionStartOffsetSec, setSectionStartOffsetSec] = useState(0);
  const [sectionDurationSec, setSectionDurationSec] = useState(0);
  const [totalMeasures, setTotalMeasures] = useState<number>(30);

  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  const [beatInBar, setBeatInBar] = useState(-1);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [bpm, setBpm] = useState(historyData.bpm);

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

  // MusicXML 로드 및 타이밍 계산
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
        setBpm(historyData.bpm || activeBpm);
        setBeatsPerBar(beats);
      } catch (e) {
        console.error('MusicXML 분석 실패:', e);
      }
    }

    loadScoreInfo();
    return () => {
      cancelled = true;
    };
  }, [historyData.bpm]);

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

      {/* [< 히스토리] 버튼 */}
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

      {/* 중앙 정렬 래퍼 */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-6 md:px-12 xl:px-0">
        {/* 상단 헤더 컴포넌트 */}
        <HistoryHeader
          title={historyData.title}
          genre={historyData.genre}
          keySig={historyData.key}
          bpm={bpm}
          playedAt={historyData.playedAt}
        />

        {/* 플레이어 컨트롤 바 컴포넌트 */}
        <HistoryPlayerBar
          isPlaying={isPlaying}
          isScoreLoading={isScoreLoading}
          beatsPerBar={beatsPerBar}
          beatInBar={beatInBar}
          onTogglePlay={handleTogglePlay}
          onRewindClick={handleRewindClick}
        />
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

      {/* 분석 파트 설정 및 리포트 카드 컴포넌트 */}
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
          <AnalysisReportList
            analyses={historyData.analyses}
            onSelectReport={(startBar, endBar, analysisId) => {
              navigate(
                `/history/${parsedHistoryId}/analysis/result?start=${startBar}&end=${endBar}&analysisId=${analysisId}`,
              );
            }}
          />
        </div>

        {/* 하단 마디 선택 및 추가 분석하기 폼 컴포넌트 */}
        <MeasureSelectForm
          startMeasure={startMeasure}
          endMeasure={endMeasure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          setStartMeasure={setStartMeasure}
          setEndMeasure={setEndMeasure}
          totalMeasures={totalMeasures}
          onSubmit={handleAddAnalysis}
        />
      </div>
    </div>
  );
}
