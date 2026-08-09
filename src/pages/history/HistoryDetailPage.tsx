import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Tone from 'tone';
import ScoreViewer, { type ScoreViewerHandle } from '@/components/score/ScoreViewer';
import { computeMeasureTimings, findMeasureIndexAtTime } from '@/utils/musicXmlTiming';
import { extractMeasureRange } from '@/utils/musicXmlMeasureRange';
import { buildMusicXmlFromRecording } from '@/utils/recordingToMusicXml';
import { toPlayedNotes } from '@/utils/midiEventPayload';
import { isValidHistoryId } from '@/utils/historyId';
import { historyDetailErrorMessage } from '@/utils/historyError';
import { useHistoryDetail } from '@/hooks/useHistory';
import { useMetronome } from '@/hooks/useMetronome';
import LoadingPage from '@/pages/common/LoadingPage';
import HistoryHeader from '@/components/history/HistoryHeader';
import HistoryPlayerBar from '@/components/history/HistoryPlayerBar';
import AnalysisReportList from '@/components/history/AnalysisReportList';
import MeasureSelectForm from '@/components/history/MeasureSelectForm';

// '4/4' → [4, 4]. 값이 없거나 형식이 깨지면 4/4로 폴백.
function parseTimeSignature(raw?: string): [number, number] {
  const [beats, beatType] = (raw ?? '').split('/').map(Number);
  return [beats > 0 ? beats : 4, beatType > 0 ? beatType : 4];
}

// 서버가 더미 문자열이나 빈 값을 내려보내는 경우가 있어 재생 가능한 URL만 통과
function toPlayableUrl(url?: string | null): string | null {
  return url && /^https?:\/\//.test(url) ? url : null;
}

// 백킹트랙 keySignature → MusicXML 조표용 key/mode
function parseKeySignature(raw?: string): { key: string; mode: 'major' | 'minor' } {
  const value = (raw ?? 'C').trim();
  const isMinor = /m(inor|in)?$/i.test(value);
  const key = value.replace(/\s*(major|minor|maj|min|m)$/i, '').trim() || 'C';
  return { key, mode: isMinor ? 'minor' : 'major' };
}

export default function HistoryDetailPage() {
  const navigate = useNavigate();
  const { historyId } = useParams<{ historyId: string }>();
  const parsedHistoryId = Number(historyId);
  const isValidId = isValidHistoryId(parsedHistoryId);

  // 히스토리 상세보기 조회
  const { data: historyData, isPending, isError, error, refetch } = useHistoryDetail(isValidId ? parsedHistoryId : 0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isScoreReady, setIsScoreReady] = useState(false);
  const [startMeasure, setStartMeasure] = useState('1마디');
  const [endMeasure, setEndMeasure] = useState('1마디');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  const [beatInBar, setBeatInBar] = useState(-1);

  const scoreViewerRef = useRef<ScoreViewerHandle>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // 커서 기준이 되는 주 오디오
  const backingAudioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlRetryRef = useRef(0);

  const { start: startMetronome, stop: stopMetronome } = useMetronome();

  const bpm = historyData?.bpm || 120;
  const [beatsPerBar, beatType] = parseTimeSignature(historyData?.timeSignature);

  const recordingUrl = toPlayableUrl(historyData?.recordingFileUrl);
  const backingTrackUrl = toPlayableUrl(historyData?.backingTrackAudioFileUrl);
  const canPlay = Boolean(recordingUrl || backingTrackUrl);

  const triggerToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const requestFreshUrl = useCallback(() => {
    if (urlRetryRef.current >= 1) return false;
    urlRetryRef.current += 1;
    refetch();
    return true;
  }, [refetch]);

  // 1) 응답의 midiEvents를 MusicXML로 변환해 실제 연주 악보를 그린다
  const xmlContent = useMemo(() => {
    if (!historyData) return '';

    const notes = toPlayedNotes(historyData.midiEvents ?? []);
    if (notes.length === 0) return '';

    const { key, mode } = parseKeySignature(historyData.key);
    return buildMusicXmlFromRecording(notes, {
      bpm: historyData.bpm || 120,
      beatsPerBar,
      beatType,
      key,
      mode,
      title: historyData.title,
    });
  }, [historyData, beatsPerBar, beatType]);

  const measureStartTimes = useMemo(
    () => (xmlContent ? computeMeasureTimings(xmlContent).measureStartTimes : []),
    [xmlContent],
  );

  // 분석 구간은 실제로 그려진 악보 안에서만 고를 수 있음
  // totalBars는 백킹트랙 길이 기준이라 연주 길이보다 클 수 있어 폴백으로만 씀
  const totalMeasures = measureStartTimes.length || (historyData?.totalBars ?? 0);
  const isScoreLoading = Boolean(xmlContent) && !isScoreReady;

  useEffect(() => {
    if (totalMeasures > 0) setEndMeasure(`${totalMeasures}마디`);
  }, [totalMeasures]);

  // 2) 오디오 엘리먼트 준비 (녹음 음원 + 백킹트랙)
  useEffect(() => {
    const createAudio = (src: string | null, label: string) => {
      if (!src) return null;
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.addEventListener('error', () => {
        console.error(`${label} 로드 실패`, { code: audio.error?.code, message: audio.error?.message, src: audio.src });
        requestFreshUrl();
      });
      audio.addEventListener('playing', () => {
        urlRetryRef.current = 0;
      });
      return audio;
    };

    audioRef.current = createAudio(recordingUrl, '녹음 음원') ?? createAudio(backingTrackUrl, '백킹트랙');
    backingAudioRef.current = recordingUrl ? createAudio(backingTrackUrl, '백킹트랙') : null;

    const created = [audioRef.current, backingAudioRef.current];
    return () => {
      created.forEach((audio) => {
        audio?.pause();
        audio?.removeAttribute('src'); // 남은 다운로드 중단
      });
      audioRef.current = null;
      backingAudioRef.current = null;
    };
  }, [recordingUrl, backingTrackUrl, requestFreshUrl]);

  const handleRewind = useCallback(() => {
    setIsPlaying(false);
    [audioRef.current, backingAudioRef.current].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    });
    setCurrentMeasureIndex(0);
    setBeatInBar(-1);
    scoreViewerRef.current?.jumpToMeasure(0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      handleRewind();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [recordingUrl, backingTrackUrl, handleRewind, triggerToast]);

  useEffect(() => {
    const audios = [audioRef.current, backingAudioRef.current].filter((a): a is HTMLAudioElement => a !== null);
    if (audios.length === 0) return;

    if (isPlaying) {
      audioRef.current?.play().catch((err) => {
        console.error('오디오 재생 실패', err);

        if (requestFreshUrl()) {
          return;
        }
        setIsPlaying(false);
      });

      // 백킹트랙은 부가 음원이라 실패해도 녹음 재생은 계속한다
      backingAudioRef.current?.play().catch((err) => {
        console.error('백킹트랙 재생 실패', err);
        requestFreshUrl();
      });
    } else {
      audios.forEach((audio) => audio.pause());
    }
  }, [isPlaying, recordingUrl, backingTrackUrl, triggerToast, requestFreshUrl]);

  // 3) 오디오 진행 시간 → 커서 위치
  useEffect(() => {
    if (!isPlaying || measureStartTimes.length === 0) return;

    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        const idx = findMeasureIndexAtTime(measureStartTimes, audio.currentTime);
        setCurrentMeasureIndex((prev) => (prev !== idx ? idx : prev));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, measureStartTimes]);

  // 4) 메트로놈
  useEffect(() => {
    if (!isPlaying) {
      stopMetronome();
      setBeatInBar(-1);
      return;
    }

    startMetronome(bpm, beatsPerBar, (time, beat) => {
      Tone.getDraw().schedule(() => setBeatInBar(beat), time);
    });

    return () => stopMetronome();
  }, [isPlaying, bpm, beatsPerBar, startMetronome, stopMetronome]);

  const handleTogglePlay = async () => {
    if (isScoreLoading) return;
    if (!canPlay) {
      triggerToast('저장된 연주 음원이 없습니다.');
      return;
    }
    await Tone.start(); // 메트로놈용 오디오 잠금 해제
    setIsPlaying((p) => !p);
  };

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

  const handleAddAnalysis = () => {
    if (!xmlContent) {
      triggerToast('연주 기록이 없어 분석 구간을 선택할 수 없습니다.');
      return;
    }

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

    if (!xmlContent) {
      triggerToast('연주 기록이 없어 분석을 시작할 수 없습니다.');
      return;
    }

    // totalBars가 null이고 악보도 비어 있으면 상한을 알 수 없으므로 범위 검사를 건너뛴다
    if (totalMeasures > 0 && (startNum > totalMeasures || endNum > totalMeasures)) {
      triggerToast('선택한 마디가 악보 범위를 벗어났습니다.');
      return;
    }

    setIsPlaying(false);
    setIsLoading(true);

    const rangeXml = extractMeasureRange(xmlContent, startNum, endNum);

    setTimeout(() => {
      setIsLoading(false);
      navigate(`/history/${parsedHistoryId}/analysis/result?start=${startNum}&end=${endNum}`, {
        state: { rangeXml },
      });
    }, 2000);
  };

  // 잘못된 id는 조회를 시도 X -> 로딩보다 먼저 처리
  if (!isValidId) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-gray-500">
        연주 히스토리가 없습니다.
      </div>
    );
  }

  if (isPending) {
    return null;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-gray-500">
        {historyDetailErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gray-950 pt-[68px] pb-[100px] font-sans text-gray-100 select-none">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-gray-950">
          {/* 페이지가 뷰포트보다 길어도 로딩 화면은 화면 중앙에 고정 */}
          <div className="sticky top-0 h-screen">
            <LoadingPage />
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          role="alert"
          className="bg-error body-small fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] px-[24px] py-[16px] text-gray-100 shadow-2xl">
          <span>⚠️</span> {toastMessage}
        </div>
      )}

      {/* [< 히스토리] 버튼  */}
      <div className="absolute top-[74px] left-[10px] z-10 shrink-0 xl:left-[35px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-[8px] text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-300 transition-colors hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="aspect-square shrink-0">
            <path
              d="M16 19.5L7 12L16 4.5"
              className="stroke-gray-400"
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
          title={historyData?.title}
          genre={historyData?.genre}
          keySig={historyData?.key}
          bpm={bpm}
          timeSignature={historyData?.timeSignature}
          durationSec={historyData?.durationSec}
          playedAt={historyData?.playedAt}
        />

        {/* 플레이어 컨트롤 바 컴포넌트 */}
        <HistoryPlayerBar
          isPlaying={isPlaying}
          isScoreLoading={isScoreLoading || !canPlay}
          beatsPerBar={beatsPerBar}
          beatInBar={beatInBar}
          onTogglePlay={handleTogglePlay}
          onRewindClick={handleRewindClick}
        />
      </div>

      {/* 악보 뷰어 영역 */}
      <div className="mx-auto mt-[24px] w-full max-w-[1280px] px-6 md:px-12 xl:px-0">
        {xmlContent ? (
          <ScoreViewer
            ref={scoreViewerRef}
            xmlContent={xmlContent}
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
        ) : (
          <div className="flex h-[440px] items-center justify-center rounded-[6px] bg-gray-900 text-gray-500">
            연주 기록이 없어 악보를 표시할 수 없습니다.
          </div>
        )}
      </div>

      {/* 분석 파트 설정 및 리포트 카드 컴포넌트 */}
      <div className="mx-auto mt-[76px] flex w-full max-w-[1280px] flex-col px-6 md:px-12 xl:px-0">
        {/* 인라인 스타일 제거 및 테일윈드 적용 */}
        <h2 className="w-full text-[24px] leading-[36px] font-medium tracking-[-0.6px] text-gray-300">
          분석 파트 설정
        </h2>

        <div className="mt-[24px] flex flex-col gap-[16px]">
          <AnalysisReportList
            analyses={historyData?.analyses ?? []}
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
