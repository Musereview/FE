import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ScoreViewer, { type ScoreViewerHandle } from '@/components/score/ScoreViewer';
import { useScoreCursorSync } from '@/hooks/music/useScoreCursorSync';
import { computeMeasureTimings } from '@/utils/musicXmlTiming';
import { extractMeasureRange } from '@/utils/musicXmlMeasureRange';
import { buildMusicXmlFromRecording } from '@/utils/recordingToMusicXml';
import { usePracticeResultStore } from '@/stores/practiceResultStore';
import { usePlayingSessionStore } from '@/stores/playingSessionStore';
import { getPlaying } from '@/apis/practice';
import type { PlayingDetail } from '@/types/practice';
import { ALL_TRACKS, RECOMMENDED_TRACKS } from '@/pages/practice/mockTracks';
import LoadingPage from '@/pages/common/LoadingPage';
import PlayIcon from '@/assets/practice/play.svg?react';

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
  const isPlayingRef = useRef(false); // 오디오 객체 교체(재생 중 recordingFileUrl 도착) 시 재생 상태 유지용

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { recording, trackId } = usePracticeResultStore();
  const playingId = usePlayingSessionStore((s) => s.playingId);
  const [playingDetail, setPlayingDetail] = useState<PlayingDetail | null>(null);

  // 언마운트 시 토스트 타이머 정리
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // 0) 연주 세션 조회 — 서버에 저장된 녹음 오디오 URL(recordingFileUrl)을 가져온다
  useEffect(() => {
    if (playingId === null) return;
    getPlaying(playingId)
      .then(setPlayingDetail)
      .catch((err) => console.error('연주 세션 조회 실패', err));
  }, [playingId]);

  // 1) 연주 화면에서 저장된 recording을 MusicXML로 변환해 악보를 그린다
  useEffect(() => {
    const track =
      [...ALL_TRACKS, ...RECOMMENDED_TRACKS].find((t) => t.id === (trackId ?? practiceId)) ?? RECOMMENDED_TRACKS[0];
    const [beatsPerBar, beatType] = track.timeSignature.split('/').map(Number);

    const text = buildMusicXmlFromRecording(recording, {
      bpm: track.bpm,
      beatsPerBar,
      beatType,
      key: track.key,
      mode: track.mode,
      title: track.title,
    });

    setXmlContent(text);
    const timings = computeMeasureTimings(text);
    setMeasureStartTimes(timings.measureStartTimes);
    if (timings.measureStartTimes.length > 0) {
      const measuresCount = timings.measureStartTimes.length;
      setTotalMeasures(measuresCount);
      setEndMeasure(`${measuresCount}마디`);
    }
  }, [recording, trackId, practiceId]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // 2) 오디오 엘리먼트 (페이지 진입 시 프리로드 적용으로 재생 딜레이 방지)
  // 연주 세션 조회로 받은 recordingFileUrl을 재생 (아직 조회 전이면 목업 mp3로 폴백)
  useEffect(() => {
    const src = playingDetail?.recordingFileUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.load();
    audioRef.current = audio;
    audio.onended = () => handleRewind();
    audio.onerror = () => {
      console.error('오디오 로드 실패', {
        src,
        error: audio.error, // MediaError: code(1~4), message
        networkState: audio.networkState,
      });
    };
    audio.onloadedmetadata = () => {
      console.log('오디오 메타데이터 로드됨', { src, duration: audio.duration, readyState: audio.readyState });
    };
    // playingDetail이 늦게 도착해 오디오 객체가 교체될 때, 이미 재생 중이었다면 새 객체도 이어서 재생
    if (isPlayingRef.current) audio.play().catch((err) => console.error('오디오 재생 실패', err));
    return () => {
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingDetail]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch((err) => console.error('오디오 재생 실패', err));
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

    audioRef.current?.pause();

    const parsedPlayingId = practiceId ? parseInt(practiceId, 10) : 31;
    const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

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
    <div className="relative min-h-screen w-full min-w-[1280px] bg-gray-950 px-4 py-[60px] font-sans text-gray-100 select-none md:px-16 xl:px-[120px]">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-gray-950">
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

      <div className="flex flex-col">
        {/* 연습으로 돌아가기 버튼 */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-[8px] text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-400 transition-colors hover:text-white">
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
          연습으로
        </button>

        <h1 className="heading-medium-b mt-[32px] text-gray-100">분석 파트 설정</h1>

        <div className="mt-[35px] flex w-full items-end justify-between">
          <div className="flex h-[52px] items-center gap-[16px]">
            {/* 재생 / 정지 버튼 */}
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
                <PlayIcon className="text-primary-400 h-[52px] w-[52px]" />
              )}
            </button>

            {/* 되돌아가기(리와인드) 버튼 */}
            <button
              type="button"
              onClick={handleRewind}
              className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[6px] bg-gray-800 transition-all outline-none hover:scale-105 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="29" height="32" viewBox="0 0 29 32" fill="none">
                <path
                  d="M19.199 0.0949879C19.6985 -0.139593 20.2939 0.0753149 20.5291 0.57448L22.8865 5.58327C23.2162 6.28388 22.9152 7.11975 22.2147 7.44948L17.2059 9.8069C16.7061 10.042 16.11 9.82714 15.8748 9.32741C15.6399 8.82774 15.8547 8.23243 16.3543 7.99733L19.4559 6.53737C17.3421 5.54543 14.9815 5.17506 12.6522 5.48171C9.9784 5.83378 7.49466 7.05815 5.5877 8.96511C3.6811 10.872 2.45629 13.3551 2.1043 16.0286C1.75241 18.7023 2.29307 21.4177 3.64141 23.7532C4.9898 26.0886 7.07094 27.9145 9.56231 28.9466C12.0537 29.9785 14.8169 30.1599 17.4217 29.4622C20.0265 28.7642 22.3288 27.2255 23.9705 25.0862C25.6121 22.9468 26.5026 20.3249 26.5027 17.6282C26.5027 17.076 26.9506 16.6283 27.5027 16.6282C28.0549 16.6283 28.5027 17.076 28.5027 17.6282C28.5026 20.7651 27.4671 23.8153 25.5574 26.304C23.6477 28.7925 20.9693 30.5819 17.9393 31.3938C14.9092 32.2055 11.6958 31.9946 8.79766 30.7942C5.89936 29.5937 3.47759 27.47 1.90899 24.7532C0.340611 22.0365 -0.287426 18.8779 0.121882 15.7678C0.531326 12.6578 1.9557 9.76929 4.17364 7.55104C6.39191 5.33277 9.28115 3.90785 12.3914 3.49831C15.0854 3.14372 17.8154 3.56818 20.2635 4.70729L18.7195 1.42604C18.4847 0.926405 18.6994 0.330066 19.199 0.0949879Z"
                  className="fill-gray-400"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-end gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label
                htmlFor="analysis-start-measure"
                className="text-[20px] leading-[30px] font-normal tracking-[-0.4px] text-gray-300">
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
              <label
                htmlFor="analysis-end-measure"
                className="text-[20px] leading-[30px] font-normal tracking-[-0.4px] text-gray-300">
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

            {/* 분석하기 버튼 */}
            <button
              type="button"
              onClick={handleStartAnalysis}
              className="button-label1 bg-primary-400 hover:bg-primary-500 flex h-[48px] cursor-pointer items-center gap-[8px] rounded-[8px] px-[24px] text-gray-950 transition-all active:scale-[0.98]">
              분석하기
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="aspect-square shrink-0">
                <path
                  d="M8.5 19.5L16.5 12L8.5 4.5"
                  className="stroke-gray-900"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
