import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import * as Tone from 'tone';
import { useQuery } from '@tanstack/react-query';

import ScoreViewer, { type ScoreViewerHandle } from '@/components/score/ScoreViewer';
import { useMetronome } from '@/hooks/useMetronome';
import { getAnalysisDetail } from '@/apis/analysis';
import {
  computeMeasureTimings,
  findMeasureIndexAtTime,
  extractActiveTempoMeterAtMeasure,
} from '@/utils/musicXmlTiming';

import MetronomeDots from '@/components/metronome/MetronomeDots';
import AnalysisChatSection from '@/components/mentor/AnalysisChatSection';
import { usePracticeResultStore, type PlayedNote } from '@/stores/practiceResultStore';
import { extractMeasureRange } from '@/utils/musicXmlMeasureRange';
import { buildMusicXmlFromRecording } from '@/utils/recordingToMusicXml';
import { toPlayedNotes } from '@/utils/midiEventPayload';
import { historyDetail } from '@/apis/history';
import type { HistoryDetailData } from '@/types/history';

function parseTimeSignature(raw?: string): [number, number] {
  const [beats, beatType] = (raw ?? '').split('/').map(Number);
  return [beats > 0 ? beats : 4, beatType > 0 ? beatType : 4];
}

function parseKeySignature(raw?: string): { key: string; mode: 'major' | 'minor' } {
  const value = (raw ?? 'C').trim();
  const isMinor = /m(inor|in)?$/i.test(value);
  const key = value.replace(/\s*(major|minor|maj|min|m)$/i, '').trim() || 'C';
  return { key, mode: isMinor ? 'minor' : 'major' };
}

export default function AnalysisResultPage() {
  const navigate = useNavigate();

  const location = useLocation();
  const {
    analysisId: passedAnalysisId,
    analysisData: passedAnalysisData,
    rangeXml: passedRangeXml,
    audioUrl: passedAudioUrl,
    audioStartOffsetSec: passedAudioOffset,
  } = location.state || {};

  const { audioBlob, latencyMs: storeLatencyMs } = usePracticeResultStore();
  const latencyMs = location.state?.latencyMs ?? storeLatencyMs ?? 0;

  const queryParams = new URLSearchParams(location.search);
  const queryAnalysisId = queryParams.get('analysisId');
  const realAnalysisId: number | undefined =
    passedAnalysisId ?? (queryAnalysisId ? Number(queryAnalysisId) : undefined);

  const [searchParams, setSearchParams] = useSearchParams();
  const startBar = parseInt(searchParams.get('start') ?? '1', 10) || 1;
  const endBar = parseInt(searchParams.get('end') ?? '15', 10) || 15;

  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(Math.max(0, startBar - 1));
  const [beatInBar, setBeatInBar] = useState(-1);
  const [beatsPerBar, setBeatsPerBar] = useState(4);

  const scoreViewerRef = useRef<ScoreViewerHandle>(null);
  const playbackTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // 백킹 트랙과 사용자 연주 녹음 파일을 동시에 제어하기 위한 두 개의 오디오 Ref
  const backingAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);

  // 진입 경로 확인 (히스토리에서 왔는지 여부)
  const isFromHistory = location.state?.fromHistory || !!queryAnalysisId;

  const { start, stop, pause } = useMetronome();

  // 1. 분석 상세 데이터 조회
  const {
    data: analysisData,
    isLoading: isQueryLoading,
    isError: isQueryError,
  } = useQuery({
    queryKey: ['analysisDetail', realAnalysisId],
    queryFn: () => getAnalysisDetail(realAnalysisId as number),
    enabled: !!realAnalysisId,
    placeholderData: passedAnalysisData,
  });

  // 2. 악보 XML 로드 및 타이밍 계산 (유저 연주 마디 기반 동적 종료 마디 반영)
  const {
    data: scoreData,
    isLoading: isScoreLoading,
    isError: isScoreError,
  } = useQuery({
    queryKey: ['scoreXmlAndTimings', passedRangeXml, realAnalysisId, startBar, endBar, analysisData?.playingId],
    queryFn: async () => {
      let text = passedRangeXml;

      let targetPlayingId = analysisData?.playingId;
      let detailResponse: HistoryDetailData | null = null;

      if (!text && !targetPlayingId && realAnalysisId) {
        try {
          const detail = await getAnalysisDetail(realAnalysisId);
          targetPlayingId = detail?.playingId;
          detailResponse = detail as unknown as HistoryDetailData;
        } catch (e) {
          console.error('분석 상세 조회 실패:', e);
        }
      }

      let calculatedOffset = passedAudioOffset ?? 0;
      let calculatedEndBar = endBar;

      if (!text && targetPlayingId) {
        try {
          if (!detailResponse || !detailResponse.midiEvents) {
            detailResponse = await historyDetail(targetPlayingId);
          }

          const notes = toPlayedNotes(detailResponse.midiEvents ?? []);
          if (notes.length > 0) {
            const [beatsPerBar, beatType] = parseTimeSignature(detailResponse.timeSignature);
            const { key, mode } = parseKeySignature(detailResponse.key);

            const adjustedRecording = notes.map((note: PlayedNote) => ({
              ...note,
              onSec: Math.max(0, note.onSec - latencyMs / 1000),
              offSec: note.offSec !== null ? Math.max(0, note.offSec - latencyMs / 1000) : null,
            }));

            const rawXml = buildMusicXmlFromRecording(adjustedRecording, {
              bpm: detailResponse.bpm || 120,
              beatsPerBar,
              beatType,
              key,
              mode,
              title: detailResponse.title || 'Practice',
              latencyMs,
            });

            const fullTimings = computeMeasureTimings(rawXml);
            calculatedOffset = fullTimings.measureStartTimes[startBar - 1] ?? 0;

            // 유저가 친 마지막 노트 시간에 맞춰 종료 마디 자동 계산
            const lastNote = adjustedRecording[adjustedRecording.length - 1];
            const lastNoteEndTime = lastNote.offSec ?? lastNote.onSec;
            let lastCalculatedBar = startBar;
            for (let i = 0; i < fullTimings.measureStartTimes.length; i++) {
              if (fullTimings.measureStartTimes[i] <= lastNoteEndTime) {
                lastCalculatedBar = i + 1;
              } else {
                break;
              }
            }
            calculatedEndBar = Math.min(lastCalculatedBar, detailResponse.totalBars || lastCalculatedBar);

            text = extractMeasureRange(rawXml, startBar, calculatedEndBar);
          }
        } catch (e) {
          console.error('히스토리 기반 악보 생성 실패:', e);
        }
      }

      if (calculatedEndBar && calculatedEndBar !== endBar) {
        setSearchParams(
          (prev) => {
            prev.set('end', String(calculatedEndBar));
            return prev;
          },
          { replace: true },
        );
      }

      if (!text) {
        return null;
      }

      text = text.replace(/<\?xml[^>]*>\s*/g, '');
      text = `<?xml version="1.0" encoding="UTF-8"?>\n` + text;

      if (!text.includes('</score-partwise>')) {
        if (!text.includes('</part>')) {
          text += '</part>\n';
        }
        text += '</score-partwise>';
      }

      const timings = computeMeasureTimings(text);
      const sIdx = 0;
      const endSec = timings.totalDuration;

      const { bpm: activeBpm, beats } = extractActiveTempoMeterAtMeasure(text, startBar);

      return {
        scoreXml: text,
        measureStartTimes: timings.measureStartTimes,
        sectionStartOffsetSec: calculatedOffset,
        sectionDurationSec: Math.max(2, endSec - calculatedOffset),
        activeBpm,
        beatsPerBar: beats,
        startIndex: sIdx,
      };
    },
    enabled: Boolean(passedRangeXml || realAnalysisId),
  });

  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisData?.recordingFileUrl && audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setLocalBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setLocalBlobUrl(null);
      };
    }
  }, [audioBlob, analysisData?.recordingFileUrl]);

  // 백킹 트랙 URL과 녹음 파일 URL 분리 정의
  const backingTrackUrl = analysisData?.backingTrackAudioFileUrl || '';
  const recordingAudioUrl = useMemo(() => {
    if (analysisData?.recordingFileUrl) return analysisData.recordingFileUrl;
    if (localBlobUrl) return localBlobUrl;
    return passedAudioUrl || '';
  }, [passedAudioUrl, analysisData?.recordingFileUrl, localBlobUrl]);

  // 백킹 트랙 오디오 엘리먼트 초기화
  useEffect(() => {
    if (!backingTrackUrl) return;
    const audio = new Audio(backingTrackUrl);
    audio.preload = 'auto';
    audio.load();

    // 초기화 직후에도 오프셋이 있다면 바로 적용
    const startOffset = scoreData?.sectionStartOffsetSec ?? 0;
    audio.currentTime = startOffset;

    backingAudioRef.current = audio;

    return () => {
      audio.pause();
      backingAudioRef.current = null;
    };
  }, [backingTrackUrl, scoreData?.sectionStartOffsetSec]);

  // 사용자 녹음 파일 오디오 엘리먼트 초기화
  useEffect(() => {
    if (!recordingAudioUrl) return;
    const audio = new Audio(recordingAudioUrl);
    audio.preload = 'auto';
    audio.load();

    const startOffset = scoreData?.sectionStartOffsetSec ?? 0;
    audio.currentTime = startOffset;

    recordingAudioRef.current = audio;

    return () => {
      audio.pause();
      recordingAudioRef.current = null;
    };
  }, [recordingAudioUrl, scoreData?.sectionStartOffsetSec]);

  const scoreXml = scoreData?.scoreXml ?? '';
  const isLoading = isQueryLoading || isScoreLoading;
  const isError = isQueryError || isScoreError;
  const bpm = analysisData?.bpm || scoreData?.activeBpm || 120;

  useEffect(() => {
    if (scoreData) setBeatsPerBar(scoreData.beatsPerBar);
  }, [scoreData]);

  useEffect(() => {
    if (!scoreData) return;

    const startOffset = scoreData.sectionStartOffsetSec ?? 0;

    playbackTimeRef.current = scoreData.sectionStartOffsetSec;
    setCurrentMeasureIndex(scoreData.startIndex);
    scoreViewerRef.current?.jumpToMeasure(scoreData.startIndex);

    if (backingAudioRef.current) {
      backingAudioRef.current.currentTime = startOffset;
    }
    if (recordingAudioRef.current) {
      recordingAudioRef.current.currentTime = startOffset;
    }
  }, [scoreData]);

  const handleRewind = useCallback(() => {
    setIsPlaying(false);
    stop();

    if (backingAudioRef.current) {
      backingAudioRef.current.pause();
      const startOffset = scoreData?.sectionStartOffsetSec ?? 0;
      backingAudioRef.current.currentTime = startOffset;
    }
    if (recordingAudioRef.current) {
      recordingAudioRef.current.pause();
      const startOffset = scoreData?.sectionStartOffsetSec ?? 0;
      recordingAudioRef.current.currentTime = startOffset;
    }

    const targetMeasureIndex = scoreData?.startIndex ?? Math.max(0, startBar - 1);
    playbackTimeRef.current = scoreData?.sectionStartOffsetSec ?? 0;
    setCurrentMeasureIndex(targetMeasureIndex);
    setBeatInBar(-1);
    scoreViewerRef.current?.jumpToMeasure(targetMeasureIndex);

    setTimeout(() => setToastMessage(null), 3000);
  }, [startBar, scoreData, stop]);

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

  // 재생 중 두 오디오와 싱크 동시 제어 및 완료 시 정지 처리
  useEffect(() => {
    if (!isPlaying || !scoreData || scoreData.measureStartTimes.length === 0) return;

    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      playbackTimeRef.current += deltaSec;
      const elapsed = playbackTimeRef.current;
      const rangeEndSec = scoreData.sectionStartOffsetSec + scoreData.sectionDurationSec;

      if (elapsed >= rangeEndSec) {
        setIsPlaying(false);
        stop();
        if (backingAudioRef.current) backingAudioRef.current.pause();
        if (recordingAudioRef.current) recordingAudioRef.current.pause();

        playbackTimeRef.current = scoreData.sectionStartOffsetSec;
        setCurrentMeasureIndex(scoreData.startIndex);
        scoreViewerRef.current?.jumpToMeasure(scoreData.startIndex);
        setToastMessage('선택한 구간 재생이 완료되었습니다.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const idx = findMeasureIndexAtTime(scoreData.measureStartTimes, Math.max(0, elapsed));
      setCurrentMeasureIndex((prev) => (prev !== idx ? idx : prev));

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, scoreData, stop]);

  const handleTogglePlay = async () => {
    if (isLoading || isError) return;
    await Tone.start();

    setIsPlaying((prev) => {
      const nextPlaying = !prev;
      const backing = backingAudioRef.current;
      const recordingAudio = recordingAudioRef.current;

      if (nextPlaying) {
        if (backing && recordingAudio) {
          recordingAudio.currentTime = backing.currentTime;
        }
        backing?.play().catch((err) => console.error('백킹 트랙 재생 실패:', err));
        recordingAudio?.play().catch((err) => console.error('녹음 파일 재생 실패:', err));
      } else {
        backing?.pause();
        recordingAudio?.pause();
      }
      return nextPlaying;
    });
  };

  const handleRewindClick = () => {
    if (isLoading || isError) return;
    handleRewind();
  };

  const formatPlayedAt = (isoString?: string) => {
    if (!isoString) return '5월 4일 · 14:32';
    const date = new Date(isoString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 · ${hours}:${minutes}`;
  };

  return (
    <div className="box-border flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-gray-950 px-4 py-[60px] text-gray-300 md:px-12 xl:px-16">
      {/* 상단 알림 토스트 메시지 */}
      {(toastMessage || isError) && (
        <div className="bg-error fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] px-[24px] py-[16px] text-[16px] font-bold text-white shadow-2xl">
          <span>⚠️</span> {toastMessage || '데이터를 불러오는 중 오류가 발생했습니다.'}
        </div>
      )}

      {/* 상단 헤더 영역 (원본 구조 유지) */}
      <div className="mb-[36px] flex w-full max-w-[1280px] flex-col gap-4">
        {isFromHistory && (
          <div>
            <button
              onClick={() => navigate('/history')}
              className="flex w-fit cursor-pointer items-center gap-[6px] text-[15px] font-medium text-gray-500 transition-colors hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-[#CECFD1]">
                <path
                  d="M16 19.5L7 12L16 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>히스토리</span>
            </button>
          </div>
        )}

        <div className="flex w-full flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="heading-medium-b text-white">{analysisData?.title || 'Jazz Standard Practice'}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-300">
                {analysisData?.genre ? analysisData.genre.toUpperCase() : 'JAZZ'}
              </span>
              <span className="rounded bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-300">
                {analysisData?.key || 'C Major'}
              </span>
              <span className="rounded bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-300">{bpm}BPM</span>
            </div>
          </div>

          <div className="caption-regular whitespace-nowrap text-gray-600">
            {formatPlayedAt(analysisData?.playedAt)}
          </div>
        </div>
      </div>

      {/* 플레이어 컨트롤 및 악보 영역 */}
      <div className="mb-[36px] flex w-full max-w-[1280px] flex-col">
        <div className="mb-[36px] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-[16px]">
            <button
              onClick={handleTogglePlay}
              disabled={isLoading || isError}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center bg-transparent transition-all outline-none hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100">
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <rect x="15" y="11" width="7" height="30" rx="2" className="fill-primary-400" />
                  <rect x="30" y="11" width="7" height="30" rx="2" className="fill-primary-400" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <path
                    d="M40.4208 25.384C41.1931 25.88 41.1931 27.12 40.4208 27.6159L16.7377 42.8254C15.9654 43.3214 15 42.7014 15 41.7095L15 11.2905C15 10.2986 15.9654 9.67858 16.7377 10.1746L40.4208 25.384Z"
                    className="fill-primary-400"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={handleRewindClick}
              disabled={isLoading || isError}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[6px] bg-gray-800 transition-all outline-none hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
                <rect width="52" height="52" rx="6" className="fill-gray-800" />
                <path
                  d="M31.199 9.86647C31.6985 9.63189 32.2939 9.8468 32.5291 10.346L34.8865 15.3548C35.2162 16.0554 34.9152 16.8912 34.2147 17.221L29.2059 19.5784C28.7061 19.8135 28.11 19.5986 27.8748 19.0989C27.6399 18.5992 27.8547 18.0039 28.3543 17.7688L31.4559 16.3089C29.3421 15.3169 26.9815 14.9465 24.6522 15.2532C21.9784 15.6053 19.4947 16.8296 17.5877 18.7366C15.6811 20.6435 14.4563 23.1266 14.1043 25.8001C13.7524 28.4737 14.2931 31.1892 15.6414 33.5247C16.9898 35.86 19.0709 37.686 21.5623 38.718C24.0537 39.75 26.8169 39.9314 29.4217 39.2337C32.0265 38.5357 34.3288 36.997 35.9705 34.8577C37.6121 32.7183 38.5026 30.0963 38.5027 27.3997C38.5027 26.8475 38.9506 26.3998 39.5027 26.3997C40.0549 26.3998 40.5027 26.8475 40.5027 27.3997C40.5026 30.5366 39.4671 33.5868 37.5574 36.0755C35.6477 38.564 32.9693 40.3534 29.9393 41.1653C26.9092 41.977 23.6958 41.7661 20.7977 40.5657C17.8994 39.3652 15.4776 37.2415 13.909 34.5247C12.3406 31.808 11.7126 28.6494 12.1219 25.5393C12.5313 22.4293 13.9557 19.5408 16.1736 17.3225C18.3919 15.1043 21.2812 13.6793 24.3914 13.2698C27.0854 12.9152 29.8154 13.3397 32.2635 14.4788L30.7195 11.1975C30.4847 10.6979 30.6994 10.1016 31.199 9.86647Z"
                  className="fill-gray-400"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center">
            <MetronomeDots total={beatsPerBar} current={isPlaying ? beatInBar : -1} />
          </div>
        </div>

        <div className="w-full">
          {scoreXml && (
            <ScoreViewer
              ref={scoreViewerRef}
              xmlContent={scoreXml}
              currentMeasureIndex={currentMeasureIndex}
              followPlayback={isPlaying}
              height={420}
              className="w-full"
              onReady={() => {
                const sIdx = scoreData?.startIndex ?? Math.max(0, startBar - 1);
                setCurrentMeasureIndex(sIdx);
                scoreViewerRef.current?.jumpToMeasure(sIdx);
              }}
            />
          )}
        </div>
      </div>

      {/* 하단 AI 연주 분석 리포트 + 멘토 채팅 섹션 */}
      <div className="mb-[36px] w-full max-w-[1280px]">
        <AnalysisChatSection
          analysisId={realAnalysisId}
          analysisData={
            analysisData
              ? {
                  analysisId: analysisData.analysisId,
                  summary: analysisData.summary,
                  report: { content: analysisData.report?.content },
                }
              : undefined
          }
        />
      </div>

      {/* 최하단 네비게이션 액션 버튼 그룹 */}
      <div className="flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={() => {
            const targetId = analysisData?.playingId;
            if (!targetId) return;
            navigate(`/practice/${targetId}/play`);
          }}
          className="cursor-pointer rounded-xl bg-gray-800 px-8 py-4 text-base font-medium text-gray-300 shadow-md transition-colors hover:bg-gray-700">
          다시 연주하기
        </button>
        <button
          onClick={() => navigate('/practice')}
          className="bg-primary-400 cursor-pointer rounded-xl px-8 py-4 text-base font-semibold text-gray-950 shadow-lg transition-opacity hover:opacity-90">
          추가 연습하기
        </button>
      </div>
    </div>
  );
}
