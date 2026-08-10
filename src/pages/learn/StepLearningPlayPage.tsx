// 단계별 학습 진행(시작) 페이지
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Tone from 'tone';
import Piano from '@/components/piano/Piano';
import LearningScoreView, { type LearningScoreHandle } from '@/components/score/LearningScoreView';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import BackingTrack from '@/components/practice/BackingTrack';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useDeviceConnection } from '@/hooks/useDeviceConnection';
import { useMetronome } from '@/hooks/useMetronome';
import { usePianoSound } from '@/hooks/usePianoSound';
import { useSettingStore } from '@/stores/settingsStore';
import { useLearningScoreStore } from '@/stores/learningScoreStore';
import type { PlayedNote } from '@/stores/practiceResultStore';
import { getLearningIds, parseStepId } from '@/utils/learningId';
import { usePracticeData } from '@/hooks/usePracticeData';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useLearningCurriculum } from '@/hooks/useLearningCurriculum';
import { parseMidiData, midiDataToMusicXml, midiDataMeasureCount, midiDataChordsToMeasures } from '@/utils/midiData';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import SettingsIcon from '@/assets/setting.svg?react';
import DeviceDisconnectedModal from '@/components/common/DeviceDisconnectedModal';

const COUNTDOWN_BEATS = 4;
function StepLearningPlayPage() {
  const navigate = useNavigate();
  const { curriculumId = '', stepId = '' } = useParams();
  const { keyCount, inputId, latencyByDevice } = useSettingStore();
  const { start, stop, pause, resume, ready } = useMetronome();
  const { noteOn: playNote, noteOff: stopNote, releaseAll } = usePianoSound();
  const setScore = useLearningScoreStore((s) => s.setScore); // 채점 결과 → 점수 화면 전달

  // 커리큘럼 메타(title/difficulty) — 단계 상세 화면과 동일
  const { data: curriculumData } = useLearningCurriculum(curriculumId);
  const title = curriculumData?.title ?? '';
  const difficulty = curriculumData?.difficulty ?? 'beginner';

  // 실습 데이터(bpm/keySignature/midiData) — '이 이론으로 실습하기'에서 조회.
  const { learningId } = getLearningIds(curriculumId);
  const {
    data: practiceData,
    isError: isPracticeDataError,
    isFetching: isPracticeDataFetching,
    refetch: refetchPracticeData,
  } = usePracticeData(learningId, parseStepId(stepId));
  const bpm = practiceData?.bpm ?? 0; // 실습 데이터 로딩 전엔 재생이 시작되지 않으므로 표시용 기본값

  // midiData 파싱 → 악보(MusicXML)/백킹트랙(코드 그리드)/전체 마디 수. 로딩 중엔 null.
  const parsedMidiData = useMemo(() => (practiceData ? parseMidiData(practiceData.midiData) : null), [practiceData]);
  if (parsedMidiData && practiceData && parsedMidiData.options.bpm !== practiceData.bpm) {
    console.warn(
      '[StepLearningPlayPage] bpm 불일치:',
      practiceData.bpm,
      'vs midiData.options.bpm',
      parsedMidiData.options.bpm,
    );
  }
  const xmlContent = useMemo(() => (parsedMidiData ? midiDataToMusicXml(parsedMidiData) : undefined), [parsedMidiData]);
  const measureCount = useMemo(() => (parsedMidiData ? midiDataMeasureCount(parsedMidiData) : 0), [parsedMidiData]);

  // 입력 레이턴시 보정값 (레이턴시 체크에서 측정한 값). 미측정/실패면 0
  const rawLatency = inputId ? latencyByDevice[inputId] : undefined;
  const latencyMs = typeof rawLatency === 'number' ? rawLatency : 0;
  // beatsPerBar: 실습 데이터 로딩 전엔 재생이 시작되지 않으므로 4/4 기본값
  const beatsPerBar = parsedMidiData?.options.beatsPerBar ?? 4;
  const measures = useMemo(
    () => (parsedMidiData ? midiDataChordsToMeasures(parsedMidiData.chords, measureCount, beatsPerBar) : []),
    [parsedMidiData, measureCount, beatsPerBar],
  );
  const totalCells = measureCount * beatsPerBar;
  // 실습 데이터가 유효하게 준비됐는지(양수 bpm·전체 셀 수) — 로딩 실패/미조회 시 재생 시작을 막는 기준
  const isPracticeReady = !!practiceData && bpm > 0 && totalCells > 0;

  // 진행률: 화면 진입 시 DB에서 받는 값(실시간 아님). 스텝 완료/다음 스텝 이동 시 현재 진행률을 DB에 반영.
  const { data: progressData } = useLearningProgress(learningId);
  const progress = progressData?.progressRate ?? curriculumData?.progress.progressRate ?? 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [beatInBar, setBeatInBar] = useState(-1); // 진행점 (마디 내 0-based)
  const [currentBeat, setCurrentBeat] = useState(-1); // 백킹트랙 전체 진행 박
  const [measureIndex, setMeasureIndex] = useState(0); // 악보 현재 진행 마디 (가운데 정렬 기준)
  const [countdown, setCountdown] = useState<number | null>(null); // 재생 전 카운트다운(4→1), null이면 비표시
  const totalBeatRef = useRef(0);
  const recordingRef = useRef<PlayedNote[]>([]); // 연주 녹음 — 채점(다음 단계)에서 정답 음과 비교
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 진입 시 자동재생 예약
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 곡 끝 → 점수 화면 이동 예약
  const scoreRef = useRef<LearningScoreHandle>(null); // 악보 판정·색칠 핸들
  const endedRef = useRef(false); // 곡 끝 정지 중복 예약 방지
  const countdownEndedRef = useRef(false); // 카운트다운 종료 중복 예약 방지
  const isMountedRef = useRef(true); // 언마운트 후 await 재개 시 재생 시작 방지
  const countdownTokenRef = useRef(0); // 클릭음 버퍼 로딩 대기 중 재시작/언마운트가 끼어들면 이전 대기를 무효화
  // 진입 자동재생(마운트 시점 클로저)이 stale bpm으로 시작하지 않도록 최신 bpm을 ref로 유지
  const bpmRef = useRef(bpm);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // 친 음: 소리 재생 + 녹음(Transport 시각 = 곡 박자 기준) + 악보 판정 색칠
  const handleNoteOn = (note: number, velocity = 100) => {
    playNote(note, velocity);
    const atSec = Tone.getTransport().seconds;
    recordingRef.current.push({ midi: note, velocity, onSec: atSec, offSec: null });
    scoreRef.current?.judge(note, atSec); // 현재 음과 대조해 Excellent/Good/Bad 색칠
  };
  const handleNoteOff = (note: number) => {
    stopNote(note);
    for (let i = recordingRef.current.length - 1; i >= 0; i--) {
      const rec = recordingRef.current[i];
      if (rec.midi === note && rec.offSec === null) {
        rec.offSec = Tone.getTransport().seconds;
        break;
      }
    }
  };

  const { activeNotes, inputs, reset: resetInput } = useActiveNotes(handleNoteOn, handleNoteOff, isPlaying); // 정지 중엔 입력 무시
  const { disconnected } = useDeviceConnection(inputs); // 선택 기기 연결 끊김 감지

  // 정지/일시정지 시점에 아직 눌린(열린) 음을 그 순간으로 확정·해제 (stuck 방지)
  const finalizeOpenNotes = () => {
    const atSec = Tone.getTransport().seconds;
    for (const rec of recordingRef.current) {
      if (rec.offSec === null) rec.offSec = atSec;
    }
    releaseAll(); // 홀드된 소리 즉시 끊기
    resetInput(); // 눌린 건반 표시 초기화
  };

  // 예약된 시작 타이머(진입 자동재생 + 재시작) 모두 취소
  const cancelPendingStarts = () => {
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    startTimerRef.current = null;
    restartTimerRef.current = null;
    finishTimerRef.current = null;
  };

  const stopPlayback = () => {
    cancelPendingStarts();
    countdownTokenRef.current += 1; // 버퍼 로딩 대기 중이던 이전 runCountdown 무효화
    finalizeOpenNotes(); // stop() 전에 (stop이 transport 위치를 0으로 리셋하므로)
    stop();
    Tone.getDraw().cancel();
    setIsPlaying(false);
    setBeatInBar(-1);
    setCurrentBeat(-1);
    setMeasureIndex(0);
    setCountdown(null); // 카운트다운 도중 정지 시 화면에 숫자가 멈춰 남지 않도록
    // 정지 시엔 색칠·판정을 지우지 않음(끝/분석 시 결과 유지).
  };

  // 곡 끝: 진행점·마디·색칠을 끝 지점 그대로 두고 재생만 멈춤 (정지 버튼과 달리 위치 리셋 안 함)
  const finishPlayback = () => {
    finalizeOpenNotes(); // stop() 전에 열린 노트 확정
    stop();
    Tone.getDraw().cancel();
    setIsPlaying(false);
    // beatInBar/currentBeat/measureIndex/색칠 모두 유지 (끝 지점 상태 그대로)
    finishTimerRef.current = setTimeout(() => goToScore(), 2000); // 2초 후 채점 결과 화면으로 이동
  };

  // 카운트다운(4,3,2,1)
  const runCountdown = async () => {
    if (!isPracticeReady) return; // 실습 데이터 미확보 시 재생 시작 금지
    cancelPendingStarts(); // 대기 중인 자동재생·재시작 타이머 취소 (중복 시작 방지)
    const token = ++countdownTokenRef.current;
    setCountdown(COUNTDOWN_BEATS); // await 전에 먼저 반영 — 재시작 시 이전 숫자가 멈춰 보이지 않도록
    countdownEndedRef.current = false;
    await Tone.start(); // 오디오 잠금 해제 (제스처 핸들러 안에서만 가능)
    await ready(); // 클릭음 버퍼 로딩이 끝난 뒤에야 카운트다운(소리+화면)을 시작 — 첫 박 소리 유실 방지
    if (!isMountedRef.current || token !== countdownTokenRef.current) return; // 언마운트/재시작 시 중단
    let cbeat = 0;
    // 카운트다운 중엔 진행점을 채우지 않는다(setBeatInBar 호출 안 함) — 실제 재생은 startPlayback()에서 시작
    // 곡 박자(3/4 등)와 무관하게 카운트인은 항상 4박 "1(강)-2-3-4"로 들리게 beatsPerBar 대신 COUNTDOWN_BEATS 사용
    start(bpmRef.current, COUNTDOWN_BEATS, (time) => {
      if (cbeat >= COUNTDOWN_BEATS) {
        if (countdownEndedRef.current) return false; // 중복 예약 방지
        countdownEndedRef.current = true;
        Tone.getDraw().schedule(() => {
          stop();
          Tone.getDraw().cancel();
          setCountdown(null);
          startPlayback();
        }, time);
        return false;
      }
      const current = cbeat;
      Tone.getDraw().schedule(() => {
        setCountdown(COUNTDOWN_BEATS - current);
      }, time);
      cbeat += 1;
    });
  };

  const startPlayback = async () => {
    if (!isPracticeReady) return; // 실습 데이터 미확보 시 재생 시작 금지
    cancelPendingStarts(); // 대기 중인 자동재생·재시작 타이머 취소 (중복 시작 방지)
    setCountdown(null);
    await Tone.start(); // 오디오 잠금 해제 (제스처 핸들러 안에서만 가능)
    if (!isMountedRef.current) return;
    totalBeatRef.current = 0;
    endedRef.current = false; // 재생 시작 시 끝 가드 해제 (재시작/재생 시 다시 정지 가능하도록)
    recordingRef.current = []; // 처음부터 재생 시 녹음 초기화
    setIsPlaying(true);
    setMeasureIndex(0);
    scoreRef.current?.reset(); // 처음부터 재생 시 색칠 초기화
    start(bpmRef.current, beatsPerBar, (time, bib) => {
      const pbeat = totalBeatRef.current; // 곡 시작 기준 현재 박(언랩)
      if (pbeat >= totalCells) {
        if (endedRef.current) return false; // 중복 예약 방지
        endedRef.current = true;
        Tone.getDraw().schedule(() => finishPlayback(), time); // 진행 위치 유지하고 정지만
        return false; // 마지막 박 클릭음 재생 방지
      }
      const beat = pbeat % totalCells;
      const measure = Math.floor(beat / beatsPerBar); // 백킹 루프와 같은 주기 — 악보 슬라이드가 백킹과 어긋나지 않게
      Tone.getDraw().schedule(() => {
        setBeatInBar(bib);
        setCurrentBeat(beat);
        setMeasureIndex(measure);
      }, time);
      totalBeatRef.current += 1;
    });
  };

  // 정지: 화면 그대로 멈춤(진행 상태 유지) / 재생: 이어서
  const pausePlayback = () => {
    pause();
    finalizeOpenNotes();
    setIsPlaying(false);
  };
  const resumePlayback = () => {
    releaseAll();
    resetInput();
    resume();
    setIsPlaying(true);
  };
  const handlePlayToggle = () => {
    if (isPlaying) pausePlayback();
    else if (Tone.getTransport().state === 'paused')
      resumePlayback(); // 일시정지 상태면 이어서
    else startPlayback(); // 처음부터
  };
  const handleRestart = () => {
    stopPlayback(); // cancelPendingStarts로 대기 타이머 정리됨
    restartTimerRef.current = setTimeout(() => runCountdown(), 80); // 연속 stop→start 글리치 방지
  };

  // 지금까지의 판정을 집계해 점수 스토어에 담고 점수 화면으로 이동
  const goToScore = () => {
    const result = scoreRef.current?.getScore();
    if (result) setScore(result);
    navigate(`/learn/curriculum/${curriculumId}/steps/${stepId}/score`);
  };

  useEffect(() => {
    if (disconnected && isPlaying) pausePlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disconnected]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop();
      Tone.getDraw().cancel();
      cancelPendingStarts();
    };
  }, [stop]);

  // 진입 시 카운트다운(4,3,2,1) →자동 재생
  // 실습 데이터가 유효하게 준비된 후에만 시작 — 로딩 중/조회 실패 fallback(bpm=0)으로 재생이 시작되는 것 방지
  useEffect(() => {
    if (!isPracticeReady) return;
    isMountedRef.current = true;
    runCountdown();
    return () => {
      isMountedRef.current = false;
      countdownTokenRef.current += 1; // 버퍼 로딩 대기 중이던 runCountdown 무효화 (StrictMode 이중 마운트 포함)
      cancelPendingStarts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPracticeReady]);

  // 악보 현재 음 하이라이트를 소수 박 해상도로 갱신 (정박 아닌 8·16분음표도 정확히 현재 음이 되도록).
  // state 갱신 없이 imperative tick 호출 → 리렌더 없음. 박 = transport ticks/PPQ (tempo 독립, onBeat 단위와 일치)
  useEffect(() => {
    if (!isPlaying) return;
    const transport = Tone.getTransport();
    let raf = 0;
    const loop = () => {
      scoreRef.current?.tick(transport.ticks / transport.PPQ);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  return (
    <div className="flex h-full flex-col bg-gray-950">
      {/* 상단 알림 토스트 — 실습 데이터 조회 실패 시 재시도 */}
      {isPracticeDataError && (
        <div
          role="alert"
          className="bg-error body-small fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] px-[24px] py-[16px] text-gray-100 shadow-2xl">
          <span>⚠️</span> 실습 데이터를 불러오지 못했습니다.
          <button
            type="button"
            onClick={() => refetchPracticeData()}
            disabled={isPracticeDataFetching}
            className="cursor-pointer rounded-[6px] bg-gray-100/20 px-3 py-1 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50">
            재시도
          </button>
        </div>
      )}

      {/* 헤더 */}
      <header className="relative flex h-[154px] w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        {/* 카운트다운 배경 블러 + 클릭 차단 */}
        {countdown !== null && <div className="absolute inset-0 z-20 bg-gray-900/60 backdrop-blur-md" />}
        {/* 재생 버튼(좌) + 제목/칩 컬럼 — 칩은 제목 아래(진행률 + BPM) */}
        <div className="flex w-[403px] items-start gap-4">
          <button
            type="button"
            onClick={handlePlayToggle}
            disabled={!isPracticeReady}
            aria-label={isPlaying ? '정지' : '재생'}
            className="text-primary-400 flex cursor-pointer items-center disabled:cursor-not-allowed disabled:opacity-50">
            {isPlaying ? <StopIcon className="h-[52px] w-[52px]" /> : <PlayIcon className="h-[52px] w-[52px]" />}
          </button>
          <div className="flex flex-col items-start gap-6">
            <div className="heading-medium-b w-[500px] text-gray-200">{title}</div>
            <div className="inline-flex w-fit items-center gap-[24px] rounded-[4px] bg-gray-400 px-3 py-1">
              <span className="button-label2 text-gray-900">진행률 {progress}%</span>
              <span className="button-label2 text-gray-900">{bpm}BPM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            disabled={!isPracticeReady}
            className="button-large2 flex h-[60px] w-[175px] cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300 disabled:cursor-not-allowed disabled:opacity-50">
            재시작
            <RefreshIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className="relative flex flex-1 flex-col px-[160px] pt-8">
        {/* 백킹트랙 + 메트로놈 진행점*/}
        <div className="relative mx-auto flex w-full max-w-[1510px] flex-col">
          <BackingTrack measures={measures} currentBeat={currentBeat} beatsPerBar={beatsPerBar} />
          <div className="absolute top-[81px] right-0 flex">
            <MetronomeDots total={beatsPerBar} current={beatInBar} />
          </div>
        </div>

        {/* 재생 전 카운트다운(4,3,2,1): 배경 블러*/}
        {countdown !== null && <div className="absolute inset-0 z-20 bg-gray-950/60 backdrop-blur-md" />}
        {countdown !== null && (
          <span className="display-large absolute top-[158px] left-1/2 z-20 -translate-x-1/2 text-center text-gray-700">
            {countdown}
          </span>
        )}

        {/* 악보 영역 — 현재 마디를 가운데 두고 이전/다음 마디가 좌우에 보이도록 슬라이딩 */}
        <div className="mx-auto mt-8 flex w-full max-w-[1510px] flex-1 items-center">
          <LearningScoreView
            ref={scoreRef}
            xmlContent={xmlContent}
            currentMeasureIndex={measureIndex}
            bpm={bpm}
            difficulty={difficulty}
            latencyMs={latencyMs}
            visibleMeasures={3}
            height={600}
            className="w-full"
          />
        </div>

        {/* 건반 */}
        <div className="relative mx-auto w-full max-w-[1560px]">
          <Piano
            keyCount={keyCount}
            activeNotes={activeNotes}
            rightSlot={
              <button
                onClick={() => navigate(`/learn/curriculum/${curriculumId}/steps/${stepId}/settings`)}
                className="flex cursor-pointer flex-col items-center gap-1"
                aria-label="설정">
                <SettingsIcon className="h-10 w-10" />
                <span className="button-small text-gray-600">설정</span>
              </button>
            }
          />
        </div>
      </div>

      {/* 모달 임시로 확인 disconnected -> (true || disconnected) 변경해서 확인 가능 */}
      {disconnected && (
        <DeviceDisconnectedModal
          onEndPractice={() => navigate(`/learn/curriculum/${curriculumId}`)}
          onGoSettings={() => navigate(`/learn/curriculum/${curriculumId}/steps/${stepId}/settings`)}
        />
      )}
    </div>
  );
}

export default StepLearningPlayPage;
